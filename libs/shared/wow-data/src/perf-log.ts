/**
 * The world editor's performance log (View > Write a performance log): every task that held up the window for 50 ms
 * or more, with the measured work it contained; anything measured that took 30 ms or more; and every 2 seconds the
 * frames drawn and where the time went. Off unless a writer is set, and then cheap: measuring is a couple of clock
 * reads.
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

let write: ((text: string) => void) | undefined;
let timer: ReturnType<typeof setInterval> | undefined;
let observer: { disconnect(): void } | undefined;
const spans: Span[] = [];
const lines: string[] = [];
const totals = new Map<string, { ms: number; count: number }>();
let frames = 0;

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
