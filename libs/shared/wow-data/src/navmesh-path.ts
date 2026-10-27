import { WorldPosition } from './coords';
import { NavMeshTile } from './navmesh';

/** How close (yards) vertices of neighbouring tiles must be to count as the same: Detour quantises them per tile. */
const WELD = 0.05;
/** How far above or below a triangle a point may be and still stand on it. */
const MAX_HEIGHT_GAP = 4;
/** A point off the mesh snaps to the nearest triangle within this many yards (horizontally). */
const MAX_SNAP = 6;

interface Point2 {
  x: number;
  y: number;
}

/** > 0 when `c` is left of the line a → b (counter-clockwise seen from above, server x north and y west). */
function area(a: Point2, b: Point2, c: Point2): number {
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

function same(a: Point2, b: Point2): boolean {
  return Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;
}

const distance = (a: WorldPosition, b: WorldPosition): number => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** Length of a path, in yards. */
export function pathLength(path: WorldPosition[]): number {
  return path.slice(1).reduce((total, point, i) => total + distance(path[i], point), 0);
}

/**
 * The walkable triangles of navigation mesh tiles, joined across tiles, to find paths on: A* from triangle to triangle,
 * then the funnel algorithm for the shortest line through them (like Detour's straight path). Server coordinates.
 */
export class NavGraph {
  private readonly vertices: WorldPosition[] = [];
  /** Three vertex indices per triangle. */
  private readonly triangles: number[] = [];
  private readonly neighbours: number[][] = [];
  private readonly centers: WorldPosition[] = [];

  constructor(tiles: NavMeshTile[]) {
    const welded = new Map<string, number>();
    const vertex = (x: number, y: number, z: number): number => {
      const key = `${Math.round(x / WELD)},${Math.round(y / WELD)},${Math.round(z / WELD)}`;
      let index = welded.get(key);
      if (index === undefined) {
        index = this.vertices.length;
        this.vertices.push({ x, y, z });
        welded.set(key, index);
      }
      return index;
    };
    for (const tile of tiles) {
      // scene axes (−y, z, −x) back to server axes
      const p = tile.positions;
      for (let i = 0; i + 8 < p.length; i += 9) {
        const corners = [0, 3, 6].map((k) => vertex(-p[i + k + 2], -p[i + k], p[i + k + 1]));
        if (new Set(corners).size === 3) {
          this.triangles.push(...corners);
        }
      }
    }
    const edges = new Map<string, number>();
    for (let t = 0; t < this.triangleCount; t++) {
      this.neighbours.push([]);
      const [a, b, c] = this.corners(t);
      this.centers.push({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3, z: (a.z + b.z + c.z) / 3 });
      for (let k = 0; k < 3; k++) {
        const [u, v] = [this.triangles[t * 3 + k], this.triangles[t * 3 + ((k + 1) % 3)]];
        const key = u < v ? `${u},${v}` : `${v},${u}`;
        const other = edges.get(key);
        if (other === undefined) {
          edges.set(key, t);
        } else {
          this.neighbours[t].push(other);
          this.neighbours[other].push(t);
        }
      }
    }
  }

  get triangleCount(): number {
    return this.triangles.length / 3;
  }

  /** The triangle a point stands on (the nearest in height), or the nearest one within a few yards. */
  locate(point: WorldPosition): number | undefined {
    let best: number | undefined;
    let bestGap = MAX_HEIGHT_GAP;
    for (let t = 0; t < this.triangleCount; t++) {
      const z = this.heightOn(t, point);
      if (z !== undefined && Math.abs(z - point.z) <= bestGap) {
        best = t;
        bestGap = Math.abs(z - point.z);
      }
    }
    if (best !== undefined) {
      return best;
    }
    let nearest = MAX_SNAP;
    for (let t = 0; t < this.triangleCount; t++) {
      const center = this.centers[t];
      const gap = Math.hypot(center.x - point.x, center.y - point.y);
      if (gap < nearest && Math.abs(center.z - point.z) <= MAX_HEIGHT_GAP * 2) {
        best = t;
        nearest = gap;
      }
    }
    return best;
  }

  /** The shortest walkable path between two points, from start to end; undefined when one can't reach the other. */
  findPath(from: WorldPosition, to: WorldPosition): WorldPosition[] | undefined {
    const start = this.locate(from);
    const goal = this.locate(to);
    if (start === undefined || goal === undefined) {
      return undefined;
    }
    const corridor = this.corridor(start, goal, to);
    return corridor && this.straighten(corridor, from, to);
  }

  private corners(t: number): WorldPosition[] {
    return [0, 1, 2].map((k) => this.vertices[this.triangles[t * 3 + k]]);
  }

  /** Height of triangle `t` under a point, when the point is above or below it. */
  private heightOn(t: number, point: WorldPosition): number | undefined {
    const [a, b, c] = this.corners(t);
    const total = area(a, b, c);
    if (total === 0) {
      return undefined;
    }
    const u = area(b, c, point) / total;
    const v = area(c, a, point) / total;
    const w = 1 - u - v;
    return u >= -1e-6 && v >= -1e-6 && w >= -1e-6 ? u * a.z + v * b.z + w * c.z : undefined;
  }

  /** A*: the triangles to cross, from start to goal. */
  private corridor(start: number, goal: number, target: WorldPosition): number[] | undefined {
    const cost = new Map<number, number>([[start, 0]]);
    const previous = new Map<number, number>();
    const open = new MinHeap();
    open.push(start, distance(this.centers[start], target));
    while (open.size > 0) {
      const current = open.pop() as number;
      if (current === goal) {
        const corridor = [goal];
        while (corridor[0] !== start) {
          corridor.unshift(previous.get(corridor[0]) as number);
        }
        return corridor;
      }
      for (const next of this.neighbours[current]) {
        const nextCost = (cost.get(current) as number) + distance(this.centers[current], this.centers[next]);
        if (nextCost < (cost.get(next) ?? Infinity)) {
          cost.set(next, nextCost);
          previous.set(next, current);
          open.push(next, nextCost + distance(this.centers[next], target));
        }
      }
    }
    return undefined;
  }

  /** The funnel ("string pulling"): the shortest line through the shared edges of the corridor. */
  private straighten(corridor: number[], from: WorldPosition, to: WorldPosition): WorldPosition[] {
    const portals: { left: WorldPosition; right: WorldPosition }[] = [];
    for (let i = 0; i + 1 < corridor.length; i++) {
      // leaving a counter-clockwise triangle through its edge u → v, v is on the left
      const [u, v] = this.sharedEdge(corridor[i], corridor[i + 1]);
      const [a, b, c] = this.corners(corridor[i]);
      portals.push(area(a, b, c) > 0 ? { left: v, right: u } : { left: u, right: v });
    }
    portals.push({ left: to, right: to });

    const path: WorldPosition[] = [from];
    let apex = from;
    let left = from;
    let right = from;
    let apexIndex = -1;
    let leftIndex = -1;
    let rightIndex = -1;
    for (let i = 0; i < portals.length; i++) {
      const { left: newLeft, right: newRight } = portals[i];
      // tighten the right side
      if (area(apex, right, newRight) >= 0) {
        if (same(apex, right) || area(apex, left, newRight) < 0) {
          right = newRight;
          rightIndex = i;
        } else {
          path.push(left);
          apex = left;
          apexIndex = leftIndex;
          right = left;
          rightIndex = leftIndex;
          i = apexIndex;
          continue;
        }
      }
      // tighten the left side
      if (area(apex, left, newLeft) <= 0) {
        if (same(apex, left) || area(apex, right, newLeft) > 0) {
          left = newLeft;
          leftIndex = i;
        } else {
          path.push(right);
          apex = right;
          apexIndex = rightIndex;
          left = right;
          leftIndex = rightIndex;
          i = apexIndex;
          continue;
        }
      }
    }
    path.push(to);
    // corners met twice in a row (the funnel restarting on them) are kept once
    return path.filter((point, i) => i === 0 || !same(point, path[i - 1]));
  }

  /** The edge two triangles share, in the order it goes around the first one (neighbours always share one). */
  private sharedEdge(t: number, u: number): WorldPosition[] {
    const theirs = new Set([0, 1, 2].map((k) => this.triangles[u * 3 + k]));
    const edge = (k: number) => [this.triangles[t * 3 + k], this.triangles[t * 3 + ((k + 1) % 3)]];
    const k = [0, 1, 2].find((i) => edge(i).every((index) => theirs.has(index))) as number;
    return edge(k).map((index) => this.vertices[index]);
  }
}

/** A binary min-heap of node ids by priority. */
class MinHeap {
  private readonly items: { id: number; priority: number }[] = [];

  get size(): number {
    return this.items.length;
  }

  push(id: number, priority: number): void {
    const items = this.items;
    items.push({ id, priority });
    let i = items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (items[parent].priority <= items[i].priority) {
        break;
      }
      [items[parent], items[i]] = [items[i], items[parent]];
      i = parent;
    }
  }

  pop(): number | undefined {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0 && last) {
      items[0] = last;
      let i = 0;
      for (;;) {
        const [l, r] = [i * 2 + 1, i * 2 + 2];
        let smallest = i;
        if (l < items.length && items[l].priority < items[smallest].priority) {
          smallest = l;
        }
        if (r < items.length && items[r].priority < items[smallest].priority) {
          smallest = r;
        }
        if (smallest === i) {
          break;
        }
        [items[smallest], items[i]] = [items[i], items[smallest]];
        i = smallest;
      }
    }
    return top?.id;
  }
}
