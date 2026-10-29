import { ParserWorker, WowParser } from './wow-parser';
import { resetLogMemory, setPerfLog } from './perf-log';
import { createParserWorker } from './wow-parser-worker-factory';

const jobs = vi.hoisted(() => ({ runParseJob: vi.fn() }));
vi.mock('./parse-jobs', () => jobs);

describe('WowParser', () => {
  beforeEach(() => jobs.runParseJob.mockReset());
  const job = { kind: 'blp' as const, bytes: new Uint8Array([1]) };

  it('parses right here without a worker, failures included', async () => {
    jobs.runParseJob.mockReturnValueOnce('image').mockImplementationOnce(() => {
      throw new Error('bad blp');
    });
    const parser = new WowParser();
    expect(await parser.run(job)).toBe('image');
    await expect(parser.run(job)).rejects.toThrowError('bad blp');
  });

  it('sends jobs to the worker and answers each with its reply', async () => {
    const posted: { id: number }[] = [];
    const worker: ParserWorker = { postMessage: (message) => posted.push(message), onmessage: null, onerror: null };
    const parser = new WowParser(worker);
    const first = parser.run(job);
    const second = parser.run(job);
    worker.onmessage?.({ data: { id: posted[1].id, error: 'bad blp' } });
    worker.onmessage?.({ data: { id: posted[0].id, result: 'image' } });
    // a reply nobody waits for
    worker.onmessage?.({ data: { id: 99, result: 'stray' } });
    expect(await first).toBe('image');
    await expect(second).rejects.toThrowError('bad blp (parsing blp)');
    expect(jobs.runParseJob).not.toHaveBeenCalled();
  });

  it('parses here when the worker stops: what it was sent and what comes after', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    jobs.runParseJob.mockReturnValue('here');
    const worker: ParserWorker = { postMessage: vi.fn(), onmessage: null, onerror: null };
    const parser = new WowParser(worker);
    const waiting = parser.run(job);
    worker.onerror?.(new Event('error'));
    expect(await waiting).toBe('here');
    expect(await parser.run(job)).toBe('here');
    expect(worker.postMessage).toHaveBeenCalledTimes(1);
    expect(warn).not.toHaveBeenCalled();
  });

  it('writes in the log why and where the worker stopped, and that parsing goes on here', () => {
    resetLogMemory();
    const write = vi.fn();
    const worker: ParserWorker = { postMessage: vi.fn(), onmessage: null, onerror: null };
    new WowParser(worker);
    worker.onerror?.({ message: 'out of memory', filename: 'worker.js', lineno: 12 });
    // (no details: nothing more to say)
    const other: ParserWorker = { postMessage: vi.fn(), onmessage: null, onerror: null };
    new WowParser(other);
    other.onerror?.(undefined);
    setPerfLog(write);
    setPerfLog(undefined);
    const text = write.mock.calls.map((call) => call[0]).join('');
    expect(text).toContain('parser: main thread (the background worker stopped with 0 files to parse)');
    expect(text).toContain('ERROR the background parser stopped: out of memory at worker.js:12; parsing on the main thread instead');
    expect(text).toContain('ERROR the background parser stopped; parsing on the main thread instead');
    resetLogMemory();
  });
});

describe('createParserWorker', () => {
  // (in these tests, window.process is Node's: the desktop app's has a type)
  const electron = process as unknown as { type?: string };
  afterEach(() => {
    vi.unstubAllGlobals();
    delete electron.type;
  });

  it('starts the worker in the desktop app only', () => {
    expect(createParserWorker()).toBeUndefined();
    electron.type = 'renderer';
    // no workers here
    vi.stubGlobal('Worker', undefined);
    expect(createParserWorker()).toBeUndefined();
    const created: unknown[] = [];
    vi.stubGlobal(
      'Worker',
      class {
        constructor(url: URL, options: unknown) {
          created.push([String(url), options]);
        }
      },
    );
    expect(createParserWorker()).toBeDefined();
    expect(created).toEqual([[expect.stringContaining('wow-parser.worker'), { type: 'module' }]]);
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('not allowed');
        }
      },
    );
    expect(createParserWorker()).toBeUndefined();
  });
});
