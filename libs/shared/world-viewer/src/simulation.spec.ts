import { sampleTimeline, simulationTimeline } from './simulation';

const p = (x: number, y = 0, z = 0) => ({ x, y, z });

describe('movement simulation timeline', () => {
  const timeline = simulationTimeline(p(0), [
    { points: [p(0), p(10)], leg: { to: p(10), speed: 2, wait: 3, label: 'point 1' } },
    { points: [p(10), p(10, 4), p(10, 8)], leg: { to: p(10, 8), speed: 4, wait: 0, label: 'point 2' } },
    { points: [p(10, 8), p(10, 8)], leg: { to: p(10, 8), speed: 0, wait: 1, label: 'point 3' } },
  ]);

  it('walks each leg at its speed, then waits, round after round', () => {
    // 5 s to point 1, 3 s there, 2 s to point 2, 1 s at point 3
    expect(timeline.duration).toBe(11);
    expect(sampleTimeline(timeline, 2.5)).toEqual({ position: p(5), orientation: 0, status: { label: 'point 1', move: 'walk' }, leg: 0 });
    expect(sampleTimeline(timeline, 6)).toEqual({
      position: p(10),
      orientation: 0,
      status: { label: 'point 1', move: 'walk', wait: 2 },
      leg: 0,
    });
    expect(sampleTimeline(timeline, 9).leg).toBe(1);
    const halfway = sampleTimeline(timeline, 9);
    expect(halfway.position).toEqual(p(10, 4));
    expect(halfway.orientation).toBeCloseTo(Math.PI / 2);
    expect(sampleTimeline(timeline, 10.5).status).toEqual({ label: 'point 3', move: 'walk', wait: 1 });
    // next round
    expect(sampleTimeline(timeline, 13.5).position).toEqual(p(5));
    // played once: standing where it ended
    expect(sampleTimeline(timeline, 13.5, false)).toEqual({ position: p(10, 8), orientation: Math.PI / 2, leg: 3 });
  });

  it('repeats only the legs from the one asked, after the first round', () => {
    // from the spawn point to point 1 once (5 s), then round point 1 (3 s wait) → point 2 (2 s) → point 3 (1 s)
    const looping = simulationTimeline(
      p(0),
      [
        { points: [p(0), p(10)], leg: { to: p(10), speed: 2, wait: 3, label: 'point 1' } },
        { points: [p(10), p(10, 8)], leg: { to: p(10, 8), speed: 4, wait: 1, label: 'point 2' } },
        { points: [p(10, 8), p(10)], leg: { to: p(10), speed: 4, wait: 3, label: 'point 1' } },
      ],
      1,
    );
    expect(looping.loopStart).toBe(8);
    expect(looping.duration).toBe(16);
    // 1 s into the second round: on the way to point 2 again, never back at the spawn point
    expect(sampleTimeline(looping, 17).position).toEqual(p(10, 4));
    expect(sampleTimeline(looping, 17).leg).toBe(1);
    // nothing to repeat (a round of no time): standing at the end
    const empty = simulationTimeline(p(0), [{ points: [p(0), p(2)], leg: { to: p(2), speed: 2, wait: 0, label: 'a' } }], 1);
    expect(sampleTimeline(empty, 5)).toEqual({ position: p(2), orientation: 0, leg: 1 });
  });

  it('tells how it moves, and what it does once there', () => {
    const moves = simulationTimeline(p(0), [
      { points: [p(0), p(2)], leg: { to: p(2), speed: 2, wait: 1, label: 'a', run: true, actions: ['script 5'] } },
      { points: [p(2), p(4)], leg: { to: p(4), speed: 2, wait: 0, label: 'b', fly: true, actions: [] } },
    ]);
    expect(sampleTimeline(moves, 0.5).status).toEqual({ label: 'a', move: 'run' });
    expect(sampleTimeline(moves, 1.5).status).toEqual({ label: 'a', move: 'run', actions: ['script 5'], wait: 1 });
    expect(sampleTimeline(moves, 2.5).status).toEqual({ label: 'b', move: 'fly' });
  });

  it('stands still when there is nothing to walk', () => {
    const still = simulationTimeline(p(1), [{ points: [p(1), p(1)], leg: { to: p(1), speed: 2, wait: 0, label: 'x' } }]);
    expect(sampleTimeline(still, 5)).toEqual({ position: p(1), orientation: 0 });
    expect(sampleTimeline(simulationTimeline(p(2), []), 1)).toEqual({ position: p(2), orientation: 0 });
  });
});
