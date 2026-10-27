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
    expect(sampleTimeline(timeline, 2.5)).toEqual({ position: p(5), orientation: 0, status: { label: 'point 1' } });
    expect(sampleTimeline(timeline, 6)).toEqual({ position: p(10), orientation: 0, status: { label: 'point 1', wait: 2 } });
    const halfway = sampleTimeline(timeline, 9);
    expect(halfway.position).toEqual(p(10, 4));
    expect(halfway.orientation).toBeCloseTo(Math.PI / 2);
    expect(sampleTimeline(timeline, 10.5).status).toEqual({ label: 'point 3', wait: 1 });
    // next round
    expect(sampleTimeline(timeline, 13.5).position).toEqual(p(5));
  });

  it('stands still when there is nothing to walk', () => {
    const still = simulationTimeline(p(1), [{ points: [p(1), p(1)], leg: { to: p(1), speed: 2, wait: 0, label: 'x' } }]);
    expect(sampleTimeline(still, 5)).toEqual({ position: p(1), orientation: 0 });
    expect(sampleTimeline(simulationTimeline(p(2), []), 1)).toEqual({ position: p(2), orientation: 0 });
  });
});
