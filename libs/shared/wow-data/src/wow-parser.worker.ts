/// <reference lib="webworker" />
import { ParseJob, runParseJob, transferables } from './parse-jobs';

/** Parses game files off the main thread: one job per message, answered with its id. */
addEventListener('message', ({ data }: MessageEvent<{ id: number; job: ParseJob }>) => {
  try {
    const result = runParseJob(data.job);
    try {
      postMessage({ id: data.id, result }, transferables(result));
    } catch {
      // a buffer that can't be handed over (shared with something kept here): copied instead
      postMessage({ id: data.id, result });
    }
  } catch (error) {
    postMessage({ id: data.id, error: (error as Error).message });
  }
});
