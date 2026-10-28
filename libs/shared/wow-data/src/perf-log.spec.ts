import {
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
    setPerfLog(undefined);
    vi.useRealTimers();
    vi.unstubAllGlobals();
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
