import type { ParserWorker } from './wow-parser';

/**
 * The background worker parsing game files, in the desktop app (where the browser has workers and the app is
 * bundled with it); undefined elsewhere, and parsing then runs on the main thread.
 */
export function createParserWorker(): ParserWorker | undefined {
  const electron = typeof window !== 'undefined' && !!(window as { process?: { type?: string } }).process?.type;
  if (!electron || typeof Worker === 'undefined') {
    return undefined;
  }
  try {
    return new Worker(new URL('./wow-parser.worker', import.meta.url), { type: 'module' }) as unknown as ParserWorker;
  } catch {
    return undefined;
  }
}
