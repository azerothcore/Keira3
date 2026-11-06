import { InjectionToken } from '@angular/core';
import { ParseJob, ParseResults, runParseJob } from './parse-jobs';
import { createParserWorker } from './wow-parser-worker-factory';
import { describeError, logFact, logProblem, perfTime } from './perf-log';

/** The part of a `Worker` the parser talks to. */
export interface ParserWorker {
  postMessage(message: { id: number; job: ParseJob }): void;
  onmessage: ((event: { data: { id: number; result?: unknown; error?: string } }) => void) | null;
  /** The worker couldn't start or crashed. */
  onerror: ((event: unknown) => void) | null;
}

interface Pending {
  job: ParseJob;
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
}

/**
 * Runs the heavy parsing (tiles, models, buildings, textures) in a background worker so loading never makes the
 * view stutter; without one (outside the desktop app, in tests), or when it fails, right here.
 */
export class WowParser {
  private nextId = 0;
  private readonly pending = new Map<number, Pending>();
  private worker?: ParserWorker;

  constructor(worker?: ParserWorker) {
    this.worker = worker;
    logFact('parser', worker ? 'background worker' : 'main thread');
    if (worker) {
      worker.onmessage = ({ data }) => {
        const job = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error !== undefined) {
          // (which kind of file: the caller adds which one)
          job?.reject(new Error(`${data.error} (parsing ${job?.job.kind})`));
        } else {
          job?.resolve(data.result);
        }
      };
      worker.onerror = (event) => {
        // no worker after all: what was sent to it, and everything from now on, runs here
        const { message, filename, lineno } = (event ?? {}) as Partial<ErrorEvent>;
        const where = filename ? ` at ${filename}:${lineno}` : '';
        logProblem(
          'error',
          `the background parser stopped${message ? `: ${describeError(message)}${where}` : ''}; parsing on the main thread instead`,
        );
        logFact('parser', `main thread (the background worker stopped with ${this.pending.size} files to parse)`);
        this.worker = undefined;
        const left = [...this.pending.values()];
        this.pending.clear();
        left.forEach(({ job, resolve, reject }) => this.runHere(job).then(resolve, reject));
      };
    }
  }

  run<K extends ParseJob['kind']>(job: Extract<ParseJob, { kind: K }>): Promise<ParseResults[K]> {
    const worker = this.worker;
    if (!worker) {
      return this.runHere(job) as Promise<ParseResults[K]>;
    }
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { job, resolve: resolve as (value: unknown) => void, reject });
      worker.postMessage({ id, job });
    });
  }

  private runHere(job: ParseJob): Promise<unknown> {
    return new Promise((resolve) => resolve(perfTime(`parse ${job.kind}`, () => runParseJob(job))));
  }
}

export const WOW_PARSER = new InjectionToken<WowParser>('WOW_PARSER', {
  providedIn: 'root',
  factory: () => new WowParser(createParserWorker()),
});
