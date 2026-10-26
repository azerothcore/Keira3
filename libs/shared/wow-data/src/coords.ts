/**
 * WoW server coordinates (as stored in `creature.position_*`, `waypoint_data.position_*`, ...):
 *   x → north, y → west, z → up (right-handed).
 *
 * Scene coordinates (Three.js, right-handed, Y-up):
 *   scene.x = −y (east), scene.y = z (up), scene.z = −x (south).
 *
 * A map is a 64 × 64 grid of ADT tiles of 533.33 yards. ADT files are named `<Map>_<tx>_<ty>.adt`, where
 * tx grows towards the east (decreasing y) and ty grows towards the south (decreasing x).
 */

export const TILE_COUNT = 64;
export const TILE_SIZE = 1600 / 3;
export const CHUNKS_PER_TILE = 16;
export const CHUNK_SIZE = TILE_SIZE / CHUNKS_PER_TILE;
export const UNIT_SIZE = CHUNK_SIZE / 8;
const HALF_TILES = TILE_COUNT / 2;

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export interface ScenePosition {
  x: number;
  y: number;
  z: number;
}

export interface TileCoord {
  tx: number;
  ty: number;
}

const clampTile = (value: number): number => Math.min(TILE_COUNT - 1, Math.max(0, value));

export function worldToTile(x: number, y: number): TileCoord {
  return {
    tx: clampTile(Math.floor(HALF_TILES - y / TILE_SIZE)),
    ty: clampTile(Math.floor(HALF_TILES - x / TILE_SIZE)),
  };
}

/** North-west corner of a tile: the maximum x and y it covers. */
export function tileOrigin(tile: TileCoord): { x: number; y: number } {
  return {
    x: (HALF_TILES - tile.ty) * TILE_SIZE,
    y: (HALF_TILES - tile.tx) * TILE_SIZE,
  };
}

/** World position of the centre of a tile (z = 0). */
export function tileCenter(tile: TileCoord): WorldPosition {
  const origin = tileOrigin(tile);
  return { x: origin.x - TILE_SIZE / 2, y: origin.y - TILE_SIZE / 2, z: 0 };
}

export function tileKey(tile: TileCoord): string {
  return `${tile.tx}_${tile.ty}`;
}

/** Tiles in a square of the given radius around `center`, nearest first, clipped to the map grid. */
export function tilesAround(center: TileCoord, radius: number): TileCoord[] {
  const tiles: TileCoord[] = [];
  for (let tx = center.tx - radius; tx <= center.tx + radius; tx++) {
    for (let ty = center.ty - radius; ty <= center.ty + radius; ty++) {
      if (tx >= 0 && ty >= 0 && tx < TILE_COUNT && ty < TILE_COUNT) {
        tiles.push({ tx, ty });
      }
    }
  }
  const distance = (t: TileCoord): number => Math.max(Math.abs(t.tx - center.tx), Math.abs(t.ty - center.ty));
  return tiles.sort((a, b) => distance(a) - distance(b));
}

/** An area of a map in server coordinates (e.g. a zone's bounds). */
export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** Tiles covering `bounds`, nearest to `center` first. */
export function tilesInBounds(bounds: WorldBounds, center: TileCoord): TileCoord[] {
  const from = worldToTile(bounds.maxX, bounds.maxY);
  const to = worldToTile(bounds.minX, bounds.minY);
  const tiles: TileCoord[] = [];
  for (let tx = from.tx; tx <= to.tx; tx++) {
    for (let ty = from.ty; ty <= to.ty; ty++) {
      tiles.push({ tx, ty });
    }
  }
  const distance = (t: TileCoord): number => Math.max(Math.abs(t.tx - center.tx), Math.abs(t.ty - center.ty));
  return tiles.sort((a, b) => distance(a) - distance(b));
}

export function worldToScene(p: WorldPosition): ScenePosition {
  return { x: -p.y, y: p.z, z: -p.x };
}

export function sceneToWorld(p: ScenePosition): WorldPosition {
  return { x: -p.z, y: -p.x, z: p.y };
}

const TWO_PI = Math.PI * 2;

/** Normalises an angle to [0, 2π). */
export function normalizeOrientation(angle: number): number {
  const normalized = angle % TWO_PI;
  return normalized < 0 ? normalized + TWO_PI : normalized;
}

/**
 * WoW orientation is measured from +x (north) towards +y (west). An object rotated by `yaw` around the
 * scene's up axis with its forward along −z faces the same way, so the two angles are identical.
 */
export function orientationToSceneYaw(orientation: number): number {
  return orientation;
}

export function sceneYawToOrientation(yaw: number): number {
  return normalizeOrientation(yaw);
}
