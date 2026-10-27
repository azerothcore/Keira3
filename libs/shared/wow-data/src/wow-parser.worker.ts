/// <reference lib="webworker" />
import { ParseJob, runParseJob } from './parse-jobs';

/** Parses game files off the main thread: one job per message, answered with its id. */
addEventListener('message', ({ data }: MessageEvent<{ id: number; job: ParseJob }>) => {
  try {
    postMessage({ id: data.id, result: runParseJob(data.job) });
  } catch (error) {
    postMessage({ id: data.id, error: (error as Error).message });
  }
});
