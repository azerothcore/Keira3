import { TaxiPathNode } from '@keira/shared/wow-data';

/**
 * Transport routes on the game map, as AoWoW draws them (`mappois.ss.php` transportRoutes / taxiPathStops, `maps.js`
 * ma_DrawRoutes): the path of a boat or zeppelin split into lines on a picture, the stops where it waits, how long it
 * takes, and the arrows showing which way it goes.
 */

/** A point on a picture, in percent of it. */
export type RoutePoint = [number, number];

/** A transport's stop: where it waits, how long (seconds), and how far it goes to the next stop (yards). */
export interface RouteStop {
  mapId: number;
  x: number;
  y: number;
  wait: number;
  leg: number;
}

/** TaxiPathNode flag: the transport teleports to the next node. */
const TELEPORT = 0x1;

/** The stops of a path (nodes it waits at), each with the distance to the next one (map changes and teleports add none). */
export function routeStops(nodes: TaxiPathNode[]): RouteStop[] {
  const stops = nodes.map((node, i) => ({ node, i })).filter(({ node }) => node.delay > 0);
  if (stops.length < 2) {
    return [];
  }
  return stops.map(({ node, i }, k) => {
    const next = stops[(k + 1) % stops.length].i;
    let leg = 0;
    for (let j = i; j !== next; j = (j + 1) % nodes.length) {
      const [a, b] = [nodes[j], nodes[(j + 1) % nodes.length]];
      if (a.mapId === b.mapId && !(a.flags & TELEPORT)) {
        leg += Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      }
    }
    return { mapId: node.mapId, x: node.x, y: node.y, wait: node.delay, leg };
  });
}

/**
 * How long a leg takes (seconds): speeding up to `speed` and braking again at `accel` (gameobject_template Data1 and
 * Data2 of transports; 30 and 1 when not given).
 */
export function legTime(distance: number, speed = 30, accel = 1): number {
  const [v, a] = [Math.max(1, speed || 30), Math.max(0.1, accel || 1)];
  return distance >= (v * v) / a ? distance / v + v / a : 2 * Math.sqrt(distance / a);
}

/** How long a whole loop takes (seconds): the waits and the legs between the stops. */
export function roundTrip(stops: RouteStop[], speed?: number, accel?: number): number {
  return stops.reduce((sum, stop) => sum + stop.wait + legTime(stop.leg, speed, accel), 0);
}

/**
 * A path's lines on a picture (in travel order, the path looping), split where it leaves the picture, changes maps or
 * teleports, simplified (Douglas–Peucker, `eps` percent); and the stops on it with their waits.
 */
export function routeLines(
  nodes: TaxiPathNode[],
  place: (node: TaxiPathNode) => RoutePoint | undefined,
  eps: number,
): { lines: RoutePoint[][]; stops: { at: RoutePoint; wait: number; node: TaxiPathNode }[] } {
  const lines: RoutePoint[][] = [];
  const stops: { at: RoutePoint; wait: number; node: TaxiPathNode }[] = [];
  let open: RoutePoint[] | undefined;
  let prev: TaxiPathNode | undefined;
  for (const node of [...nodes, nodes[0]]) {
    if (!prev || prev.mapId !== node.mapId || prev.flags & TELEPORT) {
      open = undefined;
    }
    prev = node;
    const at = place(node);
    if (!at) {
      open = undefined;
      continue;
    }
    if (!open) {
      open = [];
      lines.push(open);
    }
    open.push(at);
    if (node.delay > 0 && !stops.some((s) => s.at[0] === at[0] && s.at[1] === at[1])) {
      stops.push({ at, wait: node.delay, node });
    }
  }
  // (a line needs two points apart)
  const drawn = lines.filter((line) => line.some(([u, v]) => u !== line[0][0] || v !== line[0][1]));
  return { lines: drawn.map((line) => simplifyLine(line, eps)), stops };
}

/** Douglas–Peucker on an open line. */
export function simplifyLine(points: RoutePoint[], eps: number): RoutePoint[] {
  if (points.length < 3) {
    return points;
  }
  const [a, b] = [points[0], points[points.length - 1]];
  const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
  let [index, max] = [0, 0];
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const d = length
      ? Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / length
      : Math.hypot(p[0] - a[0], p[1] - a[1]);
    if (d > max) {
      [index, max] = [i, d];
    }
  }
  if (max <= eps) {
    return [a, b];
  }
  return [...simplifyLine(points.slice(0, index + 1), eps).slice(0, -1), ...simplifyLine(points.slice(index), eps)];
}

/**
 * Arrows along a line, `gap` pixels apart (the first half a gap in), turned the way it goes: in percent, with the angle
 * in degrees on a picture of `width` × `height` pixels.
 */
export function routeArrows(line: RoutePoint[], width: number, height: number, gap = 110): { u: number; v: number; angle: number }[] {
  const arrows: { u: number; v: number; angle: number }[] = [];
  let next = gap / 2;
  let run = 0;
  for (let j = 1; j < line.length; j++) {
    const [a, b] = [line[j - 1], line[j]];
    const [dx, dy] = [((b[0] - a[0]) * width) / 100, ((b[1] - a[1]) * height) / 100];
    const length = Math.hypot(dx, dy);
    while (length && next <= run + length) {
      const f = (next - run) / length;
      arrows.push({ u: a[0] + (b[0] - a[0]) * f, v: a[1] + (b[1] - a[1]) * f, angle: (Math.atan2(dy, dx) * 180) / Math.PI });
      next += gap;
    }
    run += length;
  }
  return arrows;
}

/** The middle of the longest line (where its number goes), with the line's angle there, never upside down. */
export function routeLabel(lines: RoutePoint[][], width: number, height: number): { u: number; v: number; angle: number } | undefined {
  const length = (line: RoutePoint[]) =>
    line.slice(1).reduce((sum, b, i) => sum + Math.hypot(((b[0] - line[i][0]) * width) / 100, ((b[1] - line[i][1]) * height) / 100), 0);
  const longest = [...lines].sort((a, b) => length(b) - length(a))[0];
  const half = longest && length(longest) / 2;
  if (!half) {
    return undefined;
  }
  let run = 0;
  for (let j = 1; ; j++) {
    const [a, b] = [longest[j - 1], longest[j]];
    const [dx, dy] = [((b[0] - a[0]) * width) / 100, ((b[1] - a[1]) * height) / 100];
    const segment = Math.hypot(dx, dy);
    if (run + segment >= half) {
      const f = (half - run) / segment;
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      return {
        u: a[0] + (b[0] - a[0]) * f,
        v: a[1] + (b[1] - a[1]) * f,
        angle: angle > 90 ? angle - 180 : angle < -90 ? angle + 180 : angle,
      };
    }
    run += segment;
  }
}

/**
 * The point of lines nearest to a point (percent), with the direction of travel there (degrees) and how far it is
 * (pixels of a `width` × `height` picture).
 */
export function routeNearest(
  lines: RoutePoint[][],
  point: RoutePoint,
  width: number,
  height: number,
): { u: number; v: number; angle: number; distance: number } | undefined {
  let best: { u: number; v: number; angle: number; distance: number } | undefined;
  const [px, py] = [(point[0] * width) / 100, (point[1] * height) / 100];
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const [ax, ay] = [(line[i - 1][0] * width) / 100, (line[i - 1][1] * height) / 100];
      const [dx, dy] = [(line[i][0] * width) / 100 - ax, (line[i][1] * height) / 100 - ay];
      const f = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
      const [qx, qy] = [ax + f * dx, ay + f * dy];
      const distance = Math.hypot(px - qx, py - qy);
      if (!best || distance < best.distance) {
        best = { u: (qx * 100) / width, v: (qy * 100) / height, angle: (Math.atan2(dy, dx) * 180) / Math.PI, distance };
      }
    }
  }
  return best;
}

/**
 * A transport's description (`transports.name`, else its gameobject's name), as AoWoW reads it:
 * "Orgrimmar and Grom'gol Base Camp (Zeppelin, Horde ("The Purple Princess"))" — where it goes, the ship's name, and
 * the side it serves.
 */
export function describeTransport(description: string): { route?: string; ship: string; side?: 'alliance' | 'horde' } {
  const ship = /\("([^"]+)"\)/.exec(description)?.[1] ?? description;
  const route = /^(.+?)\s*\(/.exec(description)?.[1];
  const side = /alliance/i.test(description) ? 'alliance' : /horde/i.test(description) ? 'horde' : undefined;
  // (a gameobject's name says what it is, not where it goes)
  const goes = route && route !== ship && !/^(boat|ship|zeppelin|gunship|turtle)\b/i.test(route);
  return { route: goes ? route.replace(/ and /, ' ↔ ') : undefined, ship, side };
}
