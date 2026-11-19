import { WorldPosition } from '@keira/shared/wow-data';
import { SimulationLeg, SimulationStatus } from './world-viewer.model';

/** A stretch of the simulated walk: moving from one point to the next, or waiting. */
interface TimelineStep {
  start: number;
  end: number;
  from: WorldPosition;
  to: WorldPosition;
  orientation: number;
  status: SimulationStatus;
  waiting: boolean;
  /** Which leg it's part of. */
  leg: number;
}

export interface Timeline {
  steps: TimelineStep[];
  /** Seconds for one round. */
  duration: number;
  /** When the part played round after round starts (0: all of it). */
  loopStart: number;
  start: WorldPosition;
}

const distance = (a: WorldPosition, b: WorldPosition): number => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
const facing = (a: WorldPosition, b: WorldPosition, previous: number): number =>
  a.x === b.x && a.y === b.y ? previous : Math.atan2(b.y - a.y, b.x - a.x);

/** What's shown during a leg: moving to it, then (`arrived`) what it does there. */
function legStatus(leg: SimulationLeg, arrived: boolean): SimulationStatus {
  return {
    label: leg.label,
    move: leg.fly ? 'fly' : leg.run ? 'run' : 'walk',
    ...(arrived && leg.actions?.length ? { actions: leg.actions } : {}),
  };
}

/**
 * The steps of one round of the simulation: each leg's route walked at its speed, then its wait. Rounds after the first
 * start at leg `loopFrom`.
 */
export function simulationTimeline(
  start: WorldPosition,
  segments: { points: WorldPosition[]; leg: SimulationLeg }[],
  loopFrom = 0,
): Timeline {
  const steps: TimelineStep[] = [];
  let time = 0;
  let orientation = 0;
  let loopStart = 0;
  segments.forEach(({ points, leg }, index) => {
    if (index === loopFrom) {
      loopStart = time;
    }
    for (let i = 0; i + 1 < points.length; i++) {
      const [from, to] = [points[i], points[i + 1]];
      const duration = leg.speed > 0 ? distance(from, to) / leg.speed : 0;
      orientation = facing(from, to, orientation);
      steps.push({ start: time, end: time + duration, from, to, orientation, status: legStatus(leg, false), waiting: false, leg: index });
      time += duration;
    }
    if (leg.wait > 0) {
      const at = points[points.length - 1];
      steps.push({
        start: time,
        end: time + leg.wait,
        from: at,
        to: at,
        orientation,
        status: legStatus(leg, true),
        waiting: true,
        leg: index,
      });
      time += leg.wait;
    }
  });
  // (no such leg: nothing repeats)
  return { steps, duration: time, loopStart: loopFrom < segments.length ? loopStart : time, start };
}

/** Where the creature is `elapsed` seconds into the simulation (rounds repeat), facing where it goes. */
export function sampleTimeline(
  timeline: Timeline,
  elapsed: number,
  loop = true,
): { position: WorldPosition; orientation: number; status?: SimulationStatus; leg?: number } {
  if (timeline.duration <= 0 || timeline.steps.length === 0) {
    return { position: timeline.start, orientation: 0 };
  }
  const last = timeline.steps[timeline.steps.length - 1];
  const round = timeline.duration - timeline.loopStart;
  if ((!loop || round <= 0) && elapsed >= timeline.duration) {
    // played once (or nothing to repeat): standing where it ended, every leg done
    return { position: last.to, orientation: last.orientation, leg: last.leg + 1 };
  }
  // (past the first round, the repeated part over and over)
  const t = elapsed < timeline.duration ? elapsed : timeline.loopStart + ((elapsed - timeline.loopStart) % round);
  // the last step ends at the duration, and a step of no length is never the one under way
  const step = timeline.steps.find((s) => t < s.end) as TimelineStep;
  const f = (t - step.start) / (step.end - step.start);
  const position = {
    x: step.from.x + (step.to.x - step.from.x) * f,
    y: step.from.y + (step.to.y - step.from.y) * f,
    z: step.from.z + (step.to.z - step.from.z) * f,
  };
  const status = step.waiting ? { ...step.status, wait: Math.ceil(step.end - t) } : step.status;
  return { position, orientation: step.orientation, status, leg: step.leg };
}
