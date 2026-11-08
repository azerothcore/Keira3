import { buildVmapModel, buildVmapTile } from './server-data.mock';
import { parseVmapModel, parseVmapTile, vmapTileName } from './vmap';

describe('vmaps', () => {
  it('names tiles by map and ADT tile numbers', () => {
    expect(vmapTileName(0, { tx: 31, ty: 49 })).toBe('000_31_49.vmtile');
  });

  it('reads the models placed in a tile, without the NUL ending M2 names', () => {
    const spawns = parseVmapTile(
      buildVmapTile([
        { name: 'Bank.wmo', flags: 4, id: 7, position: [1, 2, 3], rotation: [0, 90, 0], scale: 1 },
        { name: 'Crate.m2\0', flags: 1, scale: 0.5 },
      ]),
    );
    expect(spawns).toEqual([
      { flags: 4, id: 7, position: [1, 2, 3], rotation: [0, 90, 0], scale: 1, name: 'Bank.wmo' },
      { flags: 1, id: 2, position: [0, 0, 0], rotation: [0, 0, 0], scale: 0.5, name: 'Crate.m2' },
    ]);
    expect(parseVmapTile(new Uint8Array(4))).toEqual([]);
  });

  it('reads the groups of a model: collision triangles and liquids', () => {
    const groups = parseVmapModel(
      buildVmapModel([
        { vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] },
        { vertices: [], indices: [] },
        {
          vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0],
          indices: [0, 2, 1],
          liquid: { tilesX: 1, tilesY: 1, type: 2, heights: [5, 5, 5, 5], flags: [0] },
        },
        // a liquid without tiles: one height
        { vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2], liquid: { tilesX: 0, tilesY: 0, type: 0, heights: [7], flags: [] } },
      ]),
    );
    expect(groups).toHaveLength(4);
    expect([...(groups[3].liquid?.heights ?? [])]).toEqual([7]);
    expect(groups[3].liquid?.flags).toHaveLength(0);
    expect([...groups[0].indices]).toEqual([0, 1, 2]);
    expect(groups[0].liquid).toBeUndefined();
    expect(groups[1].vertices).toHaveLength(0);
    expect(groups[2].liquid).toEqual(expect.objectContaining({ tilesX: 1, tilesY: 1, type: 2, corner: [0, 0, 0] }));
    expect([...(groups[2].liquid?.heights ?? [])]).toEqual([5, 5, 5, 5]);
  });

  it('refuses other files', () => {
    expect(parseVmapModel(new Uint8Array(4))).toEqual([]);
    const noGroups = new TextEncoder().encode('VMAP_4.8WMOD\0\0\0\0\0\0\0\0XXXX\0\0\0\0');
    expect(parseVmapModel(noGroups)).toEqual([]);
  });
});
