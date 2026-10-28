import { TILE_SIZE } from '@keira/shared/wow-data';
import { Mesh } from 'three';
import { MapEdge, mapEdgeSegments } from './map-edge';

describe('map edge', () => {
  it('finds the sides of tiles without a tile next to them', () => {
    // one tile: its 4 sides; two side by side: 6 (the shared side is no edge)
    expect(mapEdgeSegments([{ tx: 32, ty: 32 }])).toEqual([
      [0, -TILE_SIZE, 0, 0],
      [-TILE_SIZE, -TILE_SIZE, -TILE_SIZE, 0],
      [-TILE_SIZE, 0, 0, 0],
      [-TILE_SIZE, -TILE_SIZE, 0, -TILE_SIZE],
    ]);
    expect(
      mapEdgeSegments([
        { tx: 32, ty: 32 },
        { tx: 33, ty: 32 },
      ]),
    ).toHaveLength(6);
    expect(
      mapEdgeSegments([
        { tx: 32, ty: 32 },
        { tx: 32, ty: 33 },
      ]),
    ).toHaveLength(6);
    expect(mapEdgeSegments([])).toEqual([]);
  });

  it('draws a see-through wall along the edge, not in the way of clicks', () => {
    const edge = new MapEdge();
    edge.set([{ tx: 32, ty: 32 }]);
    const wall = edge.group.children[0] as Mesh;
    expect(wall.geometry.getAttribute('position').count).toBe(4 * 6);
    const hits: unknown[] = [];
    wall.raycast({} as never, hits as never);
    expect(hits).toEqual([]);
    edge.set([]);
    expect(edge.group.children).toHaveLength(0);
    edge.set([{ tx: 1, ty: 1 }]);
    edge.dispose();
    expect(edge.group.children).toHaveLength(0);
  });
});
