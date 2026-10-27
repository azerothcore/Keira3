import { WorldPosition } from '@keira/shared/wow-data';
import { SimulationLeg } from './world-viewer.model';

/** A stretch of the simulated walk: moving from one point to the next, or waiting. */
interface TimelineStep {
  start: number;
  end: number;
  from: WorldPosition;
  to: WorldPosition;
  orientation: number;
  status: { label: string; wait?: number };
  waiting: boolean;
}

export interface Timeline {
  steps: TimelineStep[];
  /** Seconds for one round. */
  duration: number;
  start: WorldPosition;
}

const distance = (a: WorldPosition, b: WorldPosition): number => Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
const facing = (a: WorldPosition, b: WorldPosition, previous: number): number =>
  a.x === b.x && a.y === b.y ? previous : Math.atan2(b.y - a.y, b.x - a.x);

/** The steps of one round of the simulation: each leg's route walked at its speed, then its wait. */
export function simulationTimeline(start: WorldPosition, segments: { points: WorldPosition[]; leg: SimulationLeg }[]): Timeline {
  const steps: TimelineStep[] = [];
  let time = 0;
  let orientation = 0;
  for (const { points, leg } of segments) {
    for (let i = 0; i + 1 < points.length; i++) {
      const [from, to] = [points[i], points[i + 1]];
      const duration = leg.speed > 0 ? distance(from, to) / leg.speed : 0;
      orientation = facing(from, to, orientation);
      steps.push({ start: time, end: time + duration, from, to, orientation, status: { label: leg.label }, waiting: false });
      time += duration;
    }
    if (leg.wait > 0) {
      const at = points[points.length - 1];
      steps.push({ start: time, end: time + leg.wait, from: at, to: at, orientation, status: { label: leg.label }, waiting: true });
      time += leg.wait;
    }
  }
  return { steps, duration: time, start };
}

/** Where the creature is `elapsed` seconds into the simulation (rounds repeat), facing where it goes. */
export function sampleTimeline(
  timeline: Timeline,
  elapsed: number,
): { position: WorldPosition; orientation: number; status?: { label: string; wait?: number } } {
  if (timeline.duration <= 0 || timeline.steps.length === 0) {
    return { position: timeline.start, orientation: 0 };
  }
  const t = elapsed % timeline.duration;
  // the last step ends at the duration, and a step of no length is never the one under way
  const step = timeline.steps.find((s) => t < s.end) as TimelineStep;
  const f = (t - step.start) / (step.end - step.start);
  const position = {
    x: step.from.x + (step.to.x - step.from.x) * f,
    y: step.from.y + (step.to.y - step.from.y) * f,
    z: step.from.z + (step.to.z - step.from.z) * f,
  };
  const status = step.waiting ? { ...step.status, wait: Math.ceil(step.end - t) } : step.status;
  return { position, orientation: step.orientation, status };
}
