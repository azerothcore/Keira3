import { mmapOverrideYaml, mmtileName, parseMmtile } from './navmesh';
import { buildMmtile } from './navmesh.mock';

describe('navmesh', () => {
  it('names tiles like the server: map, then the ADT tile numbers swapped', () => {
    expect(mmtileName(0, { tx: 32, ty: 48 })).toBe('0004832.mmtile');
    expect(mmtileName(571, { tx: 5, ty: 7 })).toBe('5710705.mmtile');
  });

  it('reads the detail triangles of the walkable polygons, coloured by terrain', () => {
    const tile = parseMmtile(
      buildMmtile([{ flags: 0x01 }, { flags: 0x08 }, { flags: 0x02 }, { flags: 0x04 }, { flags: 1, offMesh: true }]),
    );
    // 4 polygons × 2 triangles × 3 corners
    expect(tile?.positions).toHaveLength(4 * 2 * 3 * 3);
    // recast (1, 10, 2) → scene (−1, 10, −2); the detail vertex (7, 20, 8) → (−7, 20, −8)
    expect(Array.from(tile!.positions.slice(0, 3))).toEqual([-1, 10, -2]);
    expect(Array.from(tile!.positions.slice(15, 18))).toEqual([-7, 20, -8]);
    const colorOf = (polygon: number) =>
      Array.from(tile!.colors.slice(polygon * 18, polygon * 18 + 3)).map((c) => Math.round(c * 100) / 100);
    expect(colorOf(0)).toEqual([0.2, 0.85, 0.35]);
    expect(colorOf(1)).toEqual([0.2, 0.5, 1]);
    expect(colorOf(2)).toEqual([1, 0.45, 0.1]);
    expect(colorOf(3)).toEqual([0.7, 0.3, 0.9]);
  });

  it('reads the recast settings the tile was generated with', () => {
    expect(parseMmtile(buildMmtile([{ flags: 1 }]))?.config).toEqual({
      walkableSlopeAngle: 60,
      walkableHeight: 6,
      walkableClimb: 6,
      walkableRadius: 2,
      verticesPerMapEdge: 2000,
      verticesPerTileEdge: 80,
      cellSizeHorizontal: 0.2667,
      cellSizeVertical: 0.2667,
      maxSimplificationError: 1.8,
    });
  });

  it('writes the mmaps-config.yaml overrides of a tile or a whole map', () => {
    expect(mmapOverrideYaml(0, { tx: 32, ty: 48 }, { walkableClimb: 4, walkableSlopeAngle: 45 })).toBe(
      [
        'mmapsConfig:',
        '  meshSettings:',
        '    mapsOverrides:',
        '      "0":',
        '        tilesOverrides:',
        '          "48,32":',
        '            walkableSlopeAngle: 45',
        '            walkableClimb: 4',
        '',
      ].join('\n'),
    );
    expect(mmapOverrideYaml(530, undefined, { cellSizeVertical: 0.5334 })).toBe(
      ['mmapsConfig:', '  meshSettings:', '    mapsOverrides:', '      "530":', '        cellSizeVertical: 0.5334', ''].join('\n'),
    );
  });

  it('refuses files that are not mmtiles, or cut short', () => {
    expect(parseMmtile(new Uint8Array(10))).toBeUndefined();
    const bytes = buildMmtile([{ flags: 1 }]);
    const notDetour = bytes.slice();
    notDetour[56] = 0;
    expect(parseMmtile(notDetour)).toBeUndefined();
    const notMmap = bytes.slice();
    notMmap[0] = 0;
    expect(parseMmtile(notMmap)).toBeUndefined();
    expect(parseMmtile(bytes.slice(0, bytes.length - 6))).toBeUndefined();
  });
});
