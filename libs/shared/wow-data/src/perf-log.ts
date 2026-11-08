/**
 * The world editor's log (View > Write a performance log). At the top, what's needed to make sense of the rest: Keira
 * and the system, the graphics card, the game client, the server files, the cache and the database (`logFact`), and
 * the warnings and errors since Keira started. Then as it goes: what the user did that loads or changes things, every
 * warning and error (`logProblem`, and anything written to the console as one, and errors nothing caught), every task
 * that held up the window for 50 ms or more with the measured work it contained, anything measured that took 30 ms or
 * more, and every 2 seconds the frames drawn and where the time went. Off unless a writer is set, and then cheap:
 * measuring is a couple of clock reads.
 */

interface Span {
  label: string;
  start: number;
  end: number;
}

/** Work taking this long (ms) is written down on its own. */
export const PERF_SLOW_MS = 30;
/** How often (ms) the log is written, with a summary of that time. */
export const PERF_FLUSH_MS = 2000;
/** How long (ms) measured work is kept to tell what a long task was made of. */
const SPAN_KEEP_MS = 5000;
/** How many warnings and errors are kept while the log is off (the most recent ones). */
export const PROBLEMS_KEPT = 200;
/** How much of a logged object is written (characters). */
const DESCRIBED_LENGTH = 1000;
/** How many lines of a stack are written. */
const STACK_LINES = 8;

let write: ((text: string) => void) | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let observer: { disconnect(): void } | undefined;
const spans: Span[] = [];
const lines: string[] = [];
const totals = new Map<string, { ms: number; count: number }>();
let frames = 0;
/** What the log starts with, by name: kept up to date while it's off, so each new file has it. */
const facts = new Map<string, string>();
/** The latest warnings and errors, kept while the log is off too: turning it on after one still shows it. */
const problems: string[] = [];

const time = () => new Date().toISOString().slice(11, 23);
const summary = (sums: Map<string, { ms: number; count: number }>, limit = Infinity) =>
  [...sums.entries()]
    .sort((a, b) => b[1].ms - a[1].ms)
    .slice(0, limit)
    .map(([label, sum]) => `${label} ${sum.ms.toFixed(0)}ms×${sum.count}`)
    .join(', ');

/**
 * Starts writing the log through `writer` (e.g. appending to a file), or stops (`undefined`). Long tasks are watched
 * where the browser can tell them (Chromium, so the desktop app).
 */
export function setPerfLog(writer: ((text: string) => void) | undefined): void {
  if (write) {
    flushPerfLog();
  }
  clearInterval(timer);
  observer?.disconnect();
  [timer, observer] = [undefined, undefined];
  spans.length = 0;
  lines.length = 0;
  totals.clear();
  frames = 0;
  write = writer;
  if (!writer) {
    return;
  }
  lines.push(`===== ${new Date().toISOString()} world editor performance log =====`);
  facts.forEach((text, name) => lines.push(`${name}: ${text}`));
  if (problems.length) {
    lines.push(`----- the last ${problems.length} warnings and errors before this log -----`, ...problems, '-----');
  }
  observer = observeLongTasks((start, duration) => longTask(start, duration));
  timer = setInterval(flushPerfLog, PERF_FLUSH_MS);
}

/** Whether the log is being written. */
export function perfLogActive(): boolean {
  return !!write;
}

/** Runs `run`, timing it under `label` while the log is on. */
export function perfTime<T>(label: string, run: () => T): T {
  if (!write) {
    return run();
  }
  const begin = performance.now();
  try {
    return run();
  } finally {
    const end = performance.now();
    spans.push({ label, start: begin, end });
    const sum = totals.get(label) ?? { ms: 0, count: 0 };
    totals.set(label, { ms: sum.ms + end - begin, count: sum.count + 1 });
    if (end - begin >= PERF_SLOW_MS) {
      lines.push(`${time()} slow ${label} ${(end - begin).toFixed(0)}ms`);
    }
  }
}

/** A line in the log (while it's on). */
export function perfNote(text: string): void {
  if (write) {
    lines.push(`${time()} ${text}`);
  }
}

/**
 * Something the log starts with (Keira's version, the graphics card, the client opened…), written now too if it's on.
 * Set again under the same name to replace it.
 */
export function logFact(name: string, text: string): void {
  facts.set(name, text);
  perfNote(`${name}: ${text}`);
}

/** A warning or an error: written if the log is on, and kept for the next log if not. */
export function logProblem(level: 'warning' | 'error', text: string): void {
  const line = `${time()} ${level.toUpperCase()} ${text}`;
  problems.push(line);
  if (problems.length > PROBLEMS_KEPT) {
    problems.shift();
  }
  if (write) {
    lines.push(line);
  }
}

/** An error (with the top of its stack), or anything else logged, as text for the log. */
export function describeError(value: unknown): string {
  if (value instanceof Error) {
    const stack = value.stack
      ?.split('\n')
      .slice(1, STACK_LINES + 1)
      .map((line) => line.trim())
      .join(' | ');
    return `${value.name}: ${value.message}${stack ? ` [${stack}]` : ''}`;
  }
  if (typeof value === 'string') {
    return value;
  }
  try {
    const text = JSON.stringify(plain(value)) ?? String(value);
    return text.length > DESCRIBED_LENGTH ? `${text.slice(0, DESCRIBED_LENGTH)}…` : text;
  } catch {
    return String(value);
  }
}

/** How deep into objects and arrays a logged value is written. */
const PLAIN_DEPTH = 3;

/**
 * Plain data for JSON: objects and arrays as they are (to a depth), anything else (a texture, a mesh, an element…) by
 * its kind and name: serializing those runs their own `toJSON`, which can be slow, warn, or never end.
 */
function plain(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (depth >= PLAIN_DEPTH) {
    return Array.isArray(value) ? `[${value.length} items]` : '{…}';
  }
  if (Array.isArray(value)) {
    return value.map((item) => plain(item, depth + 1));
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    const { name } = value as { name?: unknown };
    return `[${prototype.constructor?.name ?? 'object'}${typeof name === 'string' && name ? ` ${name}` : ''}]`;
  }
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item, depth + 1)]));
}

let captures = 0;
let restoreCapture: (() => void) | undefined;

/**
 * Writes down every console warning and error, uncaught error and unhandled rejection (as well as passing them on as
 * before), until the returned function is called; nested calls share the one capture.
 */
export function captureProblems(target: Pick<Window, 'addEventListener' | 'removeEventListener'> = window): () => void {
  if (captures++ === 0) {
    const original = { warn: console.warn, error: console.error };
    const warn = (...args: unknown[]) => {
      logProblem('warning', args.map(describeError).join(' '));
      original.warn.apply(console, args);
    };
    const error = (...args: unknown[]) => {
      logProblem('error', args.map(describeError).join(' '));
      original.error.apply(console, args);
    };
    const onError = (event: Event) => {
      const { error: thrown, message, filename, lineno, colno } = event as ErrorEvent;
      logProblem('error', `uncaught ${describeError(thrown ?? message)}${filename ? ` at ${filename}:${lineno}:${colno}` : ''}`);
    };
    const onRejection = (event: Event) =>
      logProblem('error', `unhandled rejection ${describeError((event as PromiseRejectionEvent).reason)}`);
    console.warn = warn;
    console.error = error;
    target.addEventListener('error', onError);
    target.addEventListener('unhandledrejection', onRejection);
    restoreCapture = () => {
      // (left alone if something else replaced them since)
      if (console.warn === warn) {
        console.warn = original.warn;
      }
      if (console.error === error) {
        console.error = original.error;
      }
      target.removeEventListener('error', onError);
      target.removeEventListener('unhandledrejection', onRejection);
    };
  }
  let released = false;
  return () => {
    if (!released) {
      released = true;
      if (--captures === 0) {
        restoreCapture?.();
        restoreCapture = undefined;
      }
    }
  };
}

/** Forgets the facts and the problems kept (for tests). */
export function resetLogMemory(): void {
  facts.clear();
  problems.length = 0;
}

/** Counts a drawn frame. */
export function perfFrame(): void {
  frames++;
}

/** A task that held up the window: what measured work it contained, and how much wasn't measured. */
export function longTask(start: number, duration: number): void {
  const end = start + duration;
  const inside = new Map<string, { ms: number; count: number }>();
  let accounted = 0;
  for (const span of spans) {
    if (span.end > start && span.start < end) {
      const ms = Math.min(span.end, end) - Math.max(span.start, start);
      const sum = inside.get(span.label) ?? { ms: 0, count: 0 };
      inside.set(span.label, { ms: sum.ms + ms, count: sum.count + 1 });
      accounted += ms;
    }
  }
  lines.push(
    `${time()} LONG TASK ${duration.toFixed(0)}ms: ${summary(inside) || '-'} | not measured ${Math.max(0, duration - accounted).toFixed(0)}ms`,
  );
}

/** Writes what was noted, with a summary of the time since the last write. */
export function flushPerfLog(): void {
  if (totals.size || frames) {
    lines.push(`${time()} ${PERF_FLUSH_MS / 1000}s: ${frames} frames | ${summary(totals, 12)}`);
    totals.clear();
    frames = 0;
  }
  if (lines.length && write) {
    try {
      write(`${lines.join('\n')}\n`);
    } catch {
      // nowhere to write: dropped
    }
  }
  lines.length = 0;
  const cutoff = performance.now() - SPAN_KEEP_MS;
  while (spans.length && spans[0].end < cutoff) {
    spans.shift();
  }
}

/** Calls `report` for each long task the browser reports; undefined where it can't. */
function observeLongTasks(report: (start: number, duration: number) => void): { disconnect(): void } | undefined {
  const Observer = (globalThis as { PerformanceObserver?: typeof PerformanceObserver }).PerformanceObserver;
  if (!Observer?.supportedEntryTypes?.includes('longtask')) {
    lines.push('(long tasks can not be watched here)');
    return undefined;
  }
  const watcher = new Observer((list) => list.getEntries().forEach((entry) => report(entry.startTime, entry.duration)));
  watcher.observe({ entryTypes: ['longtask'] });
  return watcher;
}

/** A performance log's file name: `dd_mm_yyyy_<commit>_<keira version>_hh_mm_ss.log`, in local time. */
export function perfLogFileName(at: Date, commit: string, version: string): string {
  const two = (n: number) => String(n).padStart(2, '0');
  const date = `${two(at.getDate())}_${two(at.getMonth() + 1)}_${at.getFullYear()}`;
  const time = `${two(at.getHours())}_${two(at.getMinutes())}_${two(at.getSeconds())}`;
  return `${date}_${commit}_${version}_${time}.log`;
}
