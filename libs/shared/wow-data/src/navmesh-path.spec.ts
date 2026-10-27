import { NavMeshTile } from './navmesh';
import { NavGraph, pathLength } from './navmesh-path';

/** A tile made of the given unit squares (server x, y of their corner), two triangles each, at height z. */
function tile(squares: [number, number][], z = 0, flip = false): NavMeshTile {
  const positions: number[] = [];
  const push = (x: number, y: number) => positions.push(-y, z, -x);
  for (const [x, y] of squares) {
    const corners: [number, number][] = [
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
    ];
    const tris = flip
      ? [
          [0, 2, 1],
          [0, 3, 2],
        ]
      : [
          [0, 1, 2],
          [0, 2, 3],
        ];
    tris.forEach((tri) => tri.forEach((k) => push(...corners[k])));
  }
  return { positions: Float32Array.from(positions), colors: new Float32Array(positions.length) };
}

/** An L-shaped corridor: x 0..5 along y = 0, then up along x = 4 to y = 5. */
const L_SHAPE: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0],
  [4, 1],
  [4, 2],
  [4, 3],
  [4, 4],
];

describe('NavGraph', () => {
  it('finds the straight path in an open area', () => {
    const squares: [number, number][] = [];
    for (let x = 0; x < 4; x++) {
      for (let y = 0; y < 4; y++) {
        squares.push([x, y]);
      }
    }
    const graph = new NavGraph([tile(squares)]);
    expect(graph.triangleCount).toBe(32);
    const path = graph.findPath({ x: 0.6, y: 0.2, z: 0 }, { x: 3.8, y: 3.5, z: 0 });
    expect(path).toHaveLength(2);
    expect(pathLength(path!)).toBeCloseTo(Math.hypot(3.2, 3.3));
  });

  it('keeps paths straight in open areas, whichever way they go', () => {
    const squares: [number, number][] = [];
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 6; y++) {
        squares.push([x, y]);
      }
    }
    const graph = new NavGraph([tile(squares)]);
    const ends = [
      [0.3, 5.4],
      [5.6, 0.2],
      [5.7, 5.2],
      [2.6, 0.1],
      [0.2, 2.7],
    ];
    for (const [fx, fy] of ends) {
      for (const [tx, ty] of ends) {
        const path = graph.findPath({ x: fx, y: fy, z: 0 }, { x: tx, y: ty, z: 0 }) ?? [];
        expect(pathLength(path)).toBeCloseTo(Math.hypot(tx - fx, ty - fy), 0);
      }
    }
  });

  it('goes around corners, whatever the winding of the triangles, and joins tiles', () => {
    for (const flip of [false, true]) {
      const graph = new NavGraph([tile(L_SHAPE.slice(0, 5), 0, flip), tile(L_SHAPE.slice(5), 0, !flip)]);
      const round = (path: { x: number; y: number }[] = []) =>
        path.map((p) => [Math.round(p.x * 10) / 10 + 0, Math.round(p.y * 10) / 10 + 0]);
      expect(round(graph.findPath({ x: 0.3, y: 0.6, z: 0 }, { x: 4.6, y: 4.3, z: 0 }))).toEqual([
        [0.3, 0.6],
        [4, 1],
        [4.6, 4.3],
      ]);
      // and back the other way
      expect(round(graph.findPath({ x: 4.6, y: 4.3, z: 0 }, { x: 0.3, y: 0.6, z: 0 }))).toEqual([
        [4.6, 4.3],
        [4, 1],
        [0.3, 0.6],
      ]);
    }
  });

  it('turns the other way too', () => {
    // mirrored L: along y = 0, then down to y = −4
    const squares = L_SHAPE.map(([x, y]) => [x, -y] as [number, number]);
    const graph = new NavGraph([tile(squares)]);
    const path = graph.findPath({ x: 0.3, y: 0.6, z: 0 }, { x: 4.6, y: -3.3, z: 0 }) ?? [];
    expect(path).toHaveLength(3);
    expect(path[1].x).toBe(4);
    expect(path[1].y + 0).toBe(0);
  });

  it('stands on the nearest floor in height, snaps points next to the mesh, and has no path between islands', () => {
    const graph = new NavGraph([tile([[0, 0]], 0), tile([[0, 0]], 10), tile([[20, 20]], 0)]);
    // on the upper floor, to the lower one: they aren't connected
    expect(graph.findPath({ x: 0.5, y: 0.5, z: 9 }, { x: 0.5, y: 0.5, z: 1 })).toBeUndefined();
    expect(graph.findPath({ x: 0.5, y: 0.5, z: 9 }, { x: 0.8, y: 0.2, z: 11 })).toHaveLength(2);
    // just off the mesh: snapped; far off it: nothing
    expect(graph.findPath({ x: -2, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 })).toBeDefined();
    expect(graph.findPath({ x: -50, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 0 })).toBeUndefined();
    expect(graph.findPath({ x: 0.5, y: 0.5, z: 0 }, { x: 0.5, y: 0.5, z: 40 })).toBeUndefined();
    expect(graph.findPath({ x: 0.5, y: 0.5, z: 0 }, { x: 20.5, y: 20.5, z: 0 })).toBeUndefined();
  });

  it('ignores degenerate triangles', () => {
    const flat: NavMeshTile = { positions: new Float32Array([0, 0, 0, 0, 0, 0, -1, 0, -1]), colors: new Float32Array(9) };
    const line: NavMeshTile = { positions: new Float32Array([0, 0, 0, -1, 0, -1, -2, 0, -2]), colors: new Float32Array(9) };
    expect(new NavGraph([flat]).triangleCount).toBe(0);
    const graph = new NavGraph([line]);
    expect(graph.triangleCount).toBe(1);
    expect(graph.findPath({ x: 1, y: 1, z: 0 }, { x: 1, y: 1, z: 0 })).toBeDefined();
    expect(pathLength([])).toBe(0);
  });
});
