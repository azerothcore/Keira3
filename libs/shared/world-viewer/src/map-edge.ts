import { TILE_SIZE, TileCoord, tileKey, tileOrigin, worldToScene } from '@keira/shared/wow-data';
import { BufferAttribute, BufferGeometry, DoubleSide, Group, Mesh, MeshBasicMaterial } from 'three';

/** A side of the map's edge, in server coordinates: from (x1, y1) to (x2, y2). */
export type EdgeSegment = [number, number, number, number];

/** How far the wall at the edge goes down and up (yards): it shows from anywhere the camera can be. */
const WALL_BOTTOM = -500;
const WALL_TOP = 1500;

/** The sides of the map's tiles that have no tile next to them: where the map ends. */
export function mapEdgeSegments(tiles: TileCoord[]): EdgeSegment[] {
  const present = new Set(tiles.map(tileKey));
  const has = (tx: number, ty: number) => present.has(tileKey({ tx, ty }));
  const segments: EdgeSegment[] = [];
  for (const tile of tiles) {
    const { x, y } = tileOrigin(tile);
    const [south, east] = [x - TILE_SIZE, y - TILE_SIZE];
    // north (ty − 1: bigger x), south, west (tx − 1: bigger y), east
    if (!has(tile.tx, tile.ty - 1)) segments.push([x, east, x, y]);
    if (!has(tile.tx, tile.ty + 1)) segments.push([south, east, south, y]);
    if (!has(tile.tx - 1, tile.ty)) segments.push([south, y, x, y]);
    if (!has(tile.tx + 1, tile.ty)) segments.push([south, east, x, east]);
  }
  return segments;
}

/** A see-through red wall where the map ends (the edge of its terrain tiles). */
export class MapEdge {
  readonly group = new Group();
  private readonly material = new MeshBasicMaterial({
    color: 0xff3030,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
    side: DoubleSide,
  });

  constructor() {
    this.group.name = 'map-edge';
  }

  /** The edge of these tiles (none: no wall). */
  set(tiles: TileCoord[]): void {
    this.clear();
    const segments = mapEdgeSegments(tiles);
    if (segments.length === 0) {
      return;
    }
    const positions = new Float32Array(segments.length * 18);
    segments.forEach(([x1, y1, x2, y2], i) => {
      const corner = (x: number, y: number, z: number) => {
        const p = worldToScene({ x, y, z });
        return [p.x, p.y, p.z];
      };
      const [a, b, c, d] = [corner(x1, y1, WALL_BOTTOM), corner(x2, y2, WALL_BOTTOM), corner(x2, y2, WALL_TOP), corner(x1, y1, WALL_TOP)];
      positions.set([...a, ...b, ...c, ...a, ...c, ...d], i * 18);
    });
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    const wall = new Mesh(geometry, this.material);
    wall.name = 'map-edge-wall';
    // (never in the way of clicks)
    wall.raycast = () => undefined;
    this.group.add(wall);
  }

  dispose(): void {
    this.clear();
    this.material.dispose();
  }

  private clear(): void {
    for (const child of [...this.group.children]) {
      (child as Mesh).geometry.dispose();
      this.group.remove(child);
    }
  }
}
