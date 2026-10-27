/// <reference lib="webworker" />
import { ParseJob, runParseJob, transferables } from './parse-jobs';

/** Parses game files off the main thread: one job per message, answered with its id. */
addEventListener('message', ({ data }: MessageEvent<{ id: number; job: ParseJob }>) => {
  try {
    const result = runParseJob(data.job);
    postMessage({ id: data.id, result }, transferables(result));
  } catch (error) {
    postMessage({ id: data.id, error: (error as Error).message });
  }
});
