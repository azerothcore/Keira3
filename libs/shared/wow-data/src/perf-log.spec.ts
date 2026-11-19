import {
  captureProblems,
  describeError,
  logFact,
  logProblem,
  PROBLEMS_KEPT,
  resetLogMemory,
  flushPerfLog,
  longTask,
  perfLogFileName,
  PERF_FLUSH_MS,
  perfFrame,
  perfLogActive,
  perfNote,
  perfTime,
  setPerfLog,
} from './perf-log';

describe('perf log', () => {
  afterEach(() => {
    resetLogMemory();
    setPerfLog(undefined);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('starts each log with the facts and the warnings and errors kept, and writes new ones as they come', () => {
    const write = vi.fn();
    logFact('keira', '3.10.5');
    logFact('keira', '3.10.6');
    logProblem('warning', 'a damaged cache entry');
    setPerfLog(write);
    logFact('database', 'acore_world');
    logProblem('error', 'boom');
    setPerfLog(undefined);
    const text = write.mock.calls.map((call) => call[0]).join('');
    expect(text).toContain('keira: 3.10.6');
    expect(text).not.toContain('3.10.5');
    expect(text).toMatch(/the last 1 warnings and errors before this log -----\n\S+ WARNING a damaged cache entry\n-----/);
    expect(text).toContain('database: acore_world');
    expect(text).toMatch(/\S+ ERROR boom/);
    // the next log has both problems, and only the latest few hundred are kept
    for (let i = 0; i < PROBLEMS_KEPT; i++) {
      logProblem('warning', `problem ${i}`);
    }
    const next = vi.fn();
    setPerfLog(next);
    setPerfLog(undefined);
    const nextText = next.mock.calls.map((call) => call[0]).join('');
    expect(nextText).toContain(`the last ${PROBLEMS_KEPT} warnings and errors`);
    expect(nextText).not.toContain('boom');
    expect(nextText).toContain(`problem ${PROBLEMS_KEPT - 1}`);
  });

  it('describes errors with the top of their stack, and anything else logged', () => {
    const error = new Error('bad file');
    error.stack = 'Error: bad file\n    at read (a.js:1)\n    at load (b.js:2)';
    expect(describeError(error)).toBe('Error: bad file [at read (a.js:1) | at load (b.js:2)]');
    error.stack = undefined;
    expect(describeError(error)).toBe('Error: bad file');
    expect(describeError('text')).toBe('text');
    expect(describeError({ code: 'ENOENT' })).toBe('{"code":"ENOENT"}');
    expect(describeError({ long: 'x'.repeat(2000) })).toMatch(/^\{"long":"x+…$/);
    expect(describeError(undefined)).toBe('undefined');
    const circular: { self?: unknown } = {};
    circular.self = circular;
    expect(describeError(circular)).toBe('{"self":{"self":{"self":"{…}"}}}');
    // things that aren't plain data: by their kind and name (their own toJSON is never run)
    class Texture {
      name = 'tree.blp';
      toJSON = vi.fn();
    }
    const texture = new Texture();
    expect(describeError({ texture, list: [new Texture(), [1, [2, [3]]]], bare: Object.create(null) })).toBe(
      '{"texture":"[Texture tree.blp]","list":["[Texture tree.blp]",[1,"[2 items]"]],"bare":{}}',
    );
    expect(texture.toJSON).not.toHaveBeenCalled();
    class Unnamed {}
    expect(describeError(new Unnamed())).toBe('"[Unnamed]"');
    expect(describeError(Object.assign(new Unnamed(), { name: '' }))).toBe('"[Unnamed]"');
    expect(describeError(Object.create(Object.create(null)))).toBe('"[object]"');
    const broken = {
      get value(): never {
        throw new Error('no');
      },
    };
    expect(describeError(broken)).toBe('[object Object]');
  });

  it('captures console warnings and errors, uncaught errors and unhandled rejections until released', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const target = new EventTarget();
    const release = captureProblems(target as unknown as Window);
    const nested = captureProblems(target as unknown as Window);
    const write = vi.fn();
    setPerfLog(write);
    console.warn('[World Editor] Could not read', { path: 'a.blp' });
    console.error('ERROR', new Error('broken'));
    target.dispatchEvent(Object.assign(new Event('error'), { error: new Error('thrown'), filename: 'main.js', lineno: 3, colno: 4 }));
    target.dispatchEvent(Object.assign(new Event('error'), { message: 'Script error.' }));
    target.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: 'nobody caught me' }));
    // still passed on
    expect(warn).toHaveBeenCalledWith('[World Editor] Could not read', { path: 'a.blp' });
    expect(error).toHaveBeenCalledTimes(1);
    nested();
    nested();
    console.warn('still captured');
    release();
    console.warn('not anymore');
    target.dispatchEvent(new Event('error'));
    setPerfLog(undefined);
    const text = write.mock.calls.map((call) => call[0]).join('');
    expect(text).toContain('WARNING [World Editor] Could not read {"path":"a.blp"}');
    expect(text).toContain('ERROR ERROR Error: broken');
    expect(text).toContain('ERROR uncaught Error: thrown');
    expect(text).toContain('at main.js:3:4');
    expect(text).toContain('ERROR uncaught Script error.');
    expect(text).toContain('ERROR unhandled rejection nobody caught me');
    expect(text).toContain('still captured');
    expect(text).not.toContain('not anymore');
    expect(text.match(/ERROR uncaught/g)?.length).toBe(2);
    // replaced by something else meanwhile: left as it is
    const restoreWarn = console.warn;
    const releaseAgain = captureProblems();
    const replaced = vi.fn();
    console.warn = replaced;
    console.error = replaced;
    releaseAgain();
    expect(console.warn).toBe(replaced);
    console.warn = restoreWarn;
  });

  it('only runs the work while off', () => {
    const write = vi.fn();
    expect(perfLogActive()).toBe(false);
    expect(perfTime('parse', () => 42)).toBe(42);
    perfNote('ignored');
    flushPerfLog();
    expect(write).not.toHaveBeenCalled();
  });

  it('writes slow work, long tasks with what they were made of, notes, and a summary every 2 seconds', () => {
    vi.useFakeTimers();
    const clock = { now: 0 };
    vi.spyOn(performance, 'now').mockImplementation(() => clock.now);
    const write = vi.fn();
    setPerfLog(write);
    expect(perfLogActive()).toBe(true);
    // 40 ms of parsing (slow), then 5 ms of drawing
    perfTime('parse adt', () => (clock.now += 40));
    perfTime('render', () => (clock.now += 5));
    perfFrame();
    perfNote('parser: background worker');
    // a task from 30 to 100 ms: 10 ms of the parse, all the render, the rest not measured
    longTask(30, 70);
    // one before the render began: only the parse
    longTask(0, 10);
    vi.advanceTimersByTime(PERF_FLUSH_MS);
    const text = write.mock.calls.map((call) => call[0]).join('');
    expect(text).toContain('world editor performance log');
    expect(text).toContain('slow parse adt 40ms');
    expect(text).not.toContain('slow render');
    expect(text).toContain('parser: background worker');
    expect(text).toContain('LONG TASK 70ms: parse adt 10ms×1, render 5ms×1 | not measured 55ms');
    expect(text).toContain('LONG TASK 10ms: parse adt 10ms×1 | not measured 0ms');
    expect(text).toContain('2s: 1 frames | parse adt 40ms×1, render 5ms×1');
    // nothing new: nothing written
    write.mockClear();
    vi.advanceTimersByTime(PERF_FLUSH_MS);
    expect(write).not.toHaveBeenCalled();
    // a task with nothing measured in it, and old work forgotten
    clock.now = 10_000;
    flushPerfLog();
    longTask(9000, 60);
    flushPerfLog();
    expect(write).toHaveBeenLastCalledWith(expect.stringContaining('LONG TASK 60ms: - | not measured 60ms'));
  });

  it('keeps going when it can not write, writes what is left when stopped, and watches long tasks where it can', () => {
    let report: (list: { getEntries(): { startTime: number; duration: number }[] }) => void = () => undefined;
    const disconnect = vi.fn();
    class FakeObserver {
      static supportedEntryTypes = ['longtask'];
      constructor(callback: typeof report) {
        report = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    }
    vi.stubGlobal('PerformanceObserver', FakeObserver);
    const failing = vi.fn(() => {
      throw new Error('disk full');
    });
    setPerfLog(failing);
    report({ getEntries: () => [{ startTime: 0, duration: 80 }] });
    expect(() => flushPerfLog()).not.toThrow();
    const write = vi.fn();
    setPerfLog(write);
    expect(disconnect).toHaveBeenCalled();
    perfNote('last words');
    setPerfLog(undefined);
    expect(write).toHaveBeenLastCalledWith(expect.stringContaining('last words'));

    // a browser that can't tell long tasks
    vi.stubGlobal('PerformanceObserver', class {});
    const quiet = vi.fn();
    setPerfLog(quiet);
    flushPerfLog();
    expect(quiet).toHaveBeenCalledWith(expect.stringContaining('long tasks can not be watched here'));
  });
});

describe('perfLogFileName', () => {
  it('names the log by date, commit, version and time', () => {
    expect(perfLogFileName(new Date(2026, 9, 8, 7, 5, 3), '1b7538c', '1.2.3')).toBe('08_10_2026_1b7538c_1.2.3_07_05_03.log');
  });
});
