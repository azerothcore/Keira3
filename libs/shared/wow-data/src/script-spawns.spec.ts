import { parseScriptConstants, parseScriptSpawns, scriptFileMap } from './script-spawns';

describe('script spawns', () => {
  it('knows the maps of the battleground, Wintergrasp and outdoor PvP scripts', () => {
    expect([scriptFileMap('BattlegroundEY.cpp'), scriptFileMap('BattlefieldWG.h'), scriptFileMap('OutdoorPvPEP.h')]).toEqual([566, 571, 0]);
    expect(scriptFileMap('OutdoorPvPHP.cpp')).toBe(530);
    expect(scriptFileMap('Battleground.cpp')).toBeUndefined();
  });

  it('reads constants', () => {
    const constants = parseScriptConstants('enum { A = 12, B = 3.5f, C=7 };\n#define D 99\n#define E 1.5');
    expect([...constants]).toEqual([
      ['A', 12],
      ['C', 7],
      ['D', 99],
    ]);
  });

  it('finds entries followed by a position, in calls and lists', () => {
    const constants = new Map([
      ['GO_GATE', 195000],
      ['IDX', 3],
      ['MAP_OUTLAND', 530],
      ['TOWER_CAP_ENTRY', 184081],
      ['BG_EY_POINT_RADIUS', 50],
    ]);
    const code = `
      // AddObject(1, 111111, 9.5f, 9.5f, 9.5f); (a comment)
      /* { 222222, 1.5f, 2.5f, 3.5f } */
      AddObject(BG_OBJECT_DOOR, 180000, 1.5f, 2.5f, 3.5f, 0.5f, 0, 0, 0, 1, RESPAWN);
      AddObject(1, TOWER_CAP_ENTRY, 2024.6f, 1742.8f, 1195.1f);
      { IDX, GO_GATE, 351.6f, -762.75f, 48.9f, -1.57f },
      { 182175, MAP_OUTLAND, -471.4f, 3451.0f, 34.6f },
      { 190219, 3749, 5371.46f, 3047.47f, 407.571f, 3.14159f, WALL, 0, 0 },
      { 190219, 3749, 5371.46f, 3047.47f, 407.571f },
      SetCount(12345, 1, 2, 3);
      { 7, 8, 1.5f, 2.5f, 3.5f },
      { UNKNOWN, 1.5f, 2.5f, 3.5f },
    `;
    const spawns = parseScriptSpawns(code, 'BattlegroundEY.cpp', constants);
    expect(spawns.map((s) => [s.entry, s.mapId, s.x, s.y, s.z, s.o, s.radius])).toEqual([
      [180000, 566, 1.5, 2.5, 3.5, 0.5, undefined],
      [184081, 566, 2024.6, 1742.8, 1195.1, 0, 50],
      [195000, 566, 351.6, -762.75, 48.9, -1.57, undefined],
      [182175, 530, -471.4, 3451, 34.6, 0, undefined],
      [190219, 566, 5371.46, 3047.47, 407.571, 3.14159, undefined],
    ]);
    expect(spawns[0].file).toBe('BattlegroundEY.cpp');
    // a file of no known map: nothing; a capture radius only for battlegrounds
    expect(parseScriptSpawns(code, 'Other.cpp', constants).map((s) => s.entry)).toEqual([182175]);
    expect(parseScriptSpawns(code, 'OutdoorPvPHP.h', constants).every((s) => !s.radius)).toBe(true);
  });

  it('pairs lists of entries with lists of positions, and Arathi Basin banners with their nodes', () => {
    const sa = `
      uint32 const BG_SA_ObjEntries[3] = { 190722, SMALL, 190727 };
      float const BG_SA_ObjSpawnlocs[3][4] = { { 1.5f, 2.5f, 3.5f, 4.5f }, { 5.5f, 6.5f, 7.5f, 0.5f }, { 8.5f, 9.5f, 1.5f, 0.0f } };
      uint32 const BG_XX_ObjEntries[1] = { 190000 };
    `;
    expect(parseScriptSpawns(sa, 'BattlegroundSA.h', new Map([['SMALL', 5]])).map((s) => [s.entry, s.x, s.o])).toEqual([
      [190722, 1.5, 4.5],
      [190727, 8.5, 0],
    ]);
    const ab = `
      enum { BG_AB_OBJECTID_NODE_BANNER_0 = 180087 };
      const float BG_AB_NodePositions[2][4] = {
        {1166.785f, 1200.132f, -56.70859f, 0.9075713f},
        {977.0156f, 1046.616f, -44.80923f, -2.600541f}
      };
    `;
    const constants = parseScriptConstants(ab);
    expect(parseScriptSpawns(ab, 'BattlegroundAB.h', constants).map((s) => [s.entry, s.x])).toEqual([
      [180087, 1166.785],
      [180088, 977.0156],
    ]);
    // (no positions for the banners)
    expect(parseScriptSpawns('BG_AB_OBJECTID_NODE_BANNER_0', 'BattlegroundAB.cpp', constants)).toEqual([]);
  });
});
