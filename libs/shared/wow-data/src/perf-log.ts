/*
 * TEMPORARY: world editor freeze investigation. DELETE this file, its export in index.ts and every perfTime() /
 * perfNote() / perfFrame() call before the PR is merged (search for "perf-log" and "perfTime").
 *
 * In the desktop app it writes `world-editor-perf.log` in the folder Keira was started from: every task that held up
 * the window for 50 ms or more (with the measured work it contained), anything measured that took 30 ms or more, and
 * every 2 seconds the frames drawn and where the time went.
 */
/* v8 ignore start */
interface Span {
  label: string;
  start: number;
  end: number;
}

const SLOW_MS = 30;
const spans: Span[] = [];
const lines: string[] = [];
const totals = new Map<string, { ms: number; count: number }>();
let frames = 0;
let started = false;
let logPath: string | undefined;
let fs: { appendFileSync(path: string, text: string): void } | undefined;

const time = () => new Date().toISOString().slice(11, 23);

function start(): void {
  if (started) {
    return;
  }
  started = true;
  const host = globalThis as unknown as {
    require?: (id: string) => unknown;
    process?: { type?: string; cwd(): string };
    PerformanceObserver?: typeof PerformanceObserver;
  };
  if (typeof host.require !== 'function' || !host.process?.type) {
    return;
  }
  fs = host.require('fs') as typeof fs;
  logPath = `${host.process.cwd().replace(/\\/g, '/')}/world-editor-perf.log`;
  lines.push(`\n===== ${new Date().toISOString()} world editor perf log (temporary) =====`);
  try {
    new (host.PerformanceObserver as typeof PerformanceObserver)((list) => {
      for (const entry of list.getEntries()) {
        const end = entry.startTime + entry.duration;
        const inside = new Map<string, { ms: number; count: number }>();
        let accounted = 0;
        for (const span of spans) {
          if (span.end > entry.startTime && span.start < end) {
            const ms = Math.min(span.end, end) - Math.max(span.start, entry.startTime);
            const sum = inside.get(span.label) ?? { ms: 0, count: 0 };
            inside.set(span.label, { ms: sum.ms + ms, count: sum.count + 1 });
            accounted += ms;
          }
        }
        const parts = [...inside.entries()]
          .sort((a, b) => b[1].ms - a[1].ms)
          .map(([label, sum]) => `${label} ${sum.ms.toFixed(0)}ms×${sum.count}`);
        lines.push(
          `${time()} LONG TASK ${entry.duration.toFixed(0)}ms: ${parts.join(', ') || '-'} | not measured ${Math.max(0, entry.duration - accounted).toFixed(0)}ms`,
        );
      }
    }).observe({ entryTypes: ['longtask'] });
  } catch (error) {
    lines.push(`long tasks can't be observed: ${(error as Error).message}`);
  }
  setInterval(flush, 2000);
}

function flush(): void {
  if (totals.size || frames) {
    const parts = [...totals.entries()]
      .sort((a, b) => b[1].ms - a[1].ms)
      .slice(0, 12)
      .map(([label, sum]) => `${label} ${sum.ms.toFixed(0)}ms×${sum.count}`);
    lines.push(`${time()} 2s: ${frames} frames | ${parts.join(', ')}`);
    totals.clear();
    frames = 0;
  }
  if (lines.length && fs && logPath) {
    try {
      fs.appendFileSync(logPath, `${lines.join('\n')}\n`);
    } catch {
      // nowhere to write: drop it
    }
  }
  lines.length = 0;
  // keep only the last few seconds of spans
  const cutoff = performance.now() - 5000;
  while (spans.length && spans[0].end < cutoff) {
    spans.shift();
  }
}

/** Runs `run`, timing it under `label`. */
export function perfTime<T>(label: string, run: () => T): T {
  start();
  const begin = performance.now();
  try {
    return run();
  } finally {
    const end = performance.now();
    spans.push({ label, start: begin, end });
    const sum = totals.get(label) ?? { ms: 0, count: 0 };
    totals.set(label, { ms: sum.ms + end - begin, count: sum.count + 1 });
    if (end - begin >= SLOW_MS) {
      lines.push(`${time()} slow ${label} ${(end - begin).toFixed(0)}ms`);
    }
  }
}

/** A line in the log. */
export function perfNote(text: string): void {
  start();
  lines.push(`${time()} ${text}`);
}

/** Counts a drawn frame. */
export function perfFrame(): void {
  frames++;
}
/* v8 ignore stop */
