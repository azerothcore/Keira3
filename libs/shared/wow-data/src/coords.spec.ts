import {
  normalizeOrientation,
  orientationToSceneYaw,
  sceneToWorld,
  sceneYawToOrientation,
  tileCenter,
  tileKey,
  tileOrigin,
  tilesAround,
  tilesInBounds,
  TILE_SIZE,
  worldToScene,
  worldToTile,
} from './coords';

describe('coords', () => {
  it('maps world positions to ADT tiles (Northshire is Azeroth_32_48, Goldshire is 31_49)', () => {
    expect(worldToTile(-8913, -137)).toEqual({ tx: 32, ty: 48 });
    expect(worldToTile(-9464, 62)).toEqual({ tx: 31, ty: 49 });
  });

  it('clamps positions outside the map grid', () => {
    expect(worldToTile(1e6, 1e6)).toEqual({ tx: 0, ty: 0 });
    expect(worldToTile(-1e6, -1e6)).toEqual({ tx: 63, ty: 63 });
  });

  it('computes tile origin (north-west corner) and centre', () => {
    expect(tileOrigin({ tx: 32, ty: 48 })).toEqual({ x: -16 * TILE_SIZE, y: 0 });
    const center = tileCenter({ tx: 32, ty: 48 });
    expect(center.x).toBeCloseTo(-16.5 * TILE_SIZE);
    expect(center.y).toBeCloseTo(-0.5 * TILE_SIZE);
    expect(center.z).toBe(0);
    expect(worldToTile(center.x, center.y)).toEqual({ tx: 32, ty: 48 });
  });

  it('builds tile keys', () => {
    expect(tileKey({ tx: 3, ty: 7 })).toBe('3_7');
  });

  it('lists tiles around a centre, nearest first and clipped to the grid', () => {
    const tiles = tilesAround({ tx: 10, ty: 10 }, 1);
    expect(tiles.length).toBe(9);
    expect(tiles[0]).toEqual({ tx: 10, ty: 10 });
    expect(tilesAround({ tx: 0, ty: 63 }, 1).length).toBe(4);
    // looking north (+x: towards lower ty), the northern tiles of each ring come first
    const north = tilesAround({ tx: 10, ty: 10 }, 1, { x: 1, y: 0 });
    expect(north[0]).toEqual({ tx: 10, ty: 10 });
    expect(north.slice(1, 4).every((t) => t.ty === 9)).toBe(true);
    // looking west (+y: towards lower tx)
    expect(
      tilesAround({ tx: 10, ty: 10 }, 1, { x: 0, y: 1 })
        .slice(1, 4)
        .every((t) => t.tx === 9),
    ).toBe(true);
  });

  it('converts between world and scene coordinates', () => {
    const world = { x: 1, y: 2, z: 3 };
    const scene = worldToScene(world);
    expect(scene).toEqual({ x: -2, y: 3, z: -1 });
    expect(sceneToWorld(scene)).toEqual(world);
  });

  it('normalizes orientations to [0, 2π)', () => {
    expect(normalizeOrientation(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);
    expect(normalizeOrientation(5 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeOrientation(1)).toBe(1);
  });

  it('converts orientation to scene yaw and back', () => {
    expect(orientationToSceneYaw(1.5)).toBe(1.5);
    expect(sceneYawToOrientation(-0.5)).toBeCloseTo(Math.PI * 2 - 0.5);
  });

  it('lists the tiles covering an area, nearest first', () => {
    const elwynn = { minX: -9900, maxX: -8800, minY: -1200, maxY: 600 };
    const tiles = tilesInBounds(elwynn, { tx: 32, ty: 48 });
    expect(tiles[0]).toEqual({ tx: 32, ty: 48 });
    expect(tiles).toHaveLength(5 * 3);
    expect(tiles).toContainEqual(worldToTile(-9900, -1200));
    expect(tiles).toContainEqual(worldToTile(-8800, 600));
  });
});
