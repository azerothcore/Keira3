import { FactionTemplate } from '@keira/shared/wow-data';
import {
  factionSide,
  friendlySides,
  GAME_MAP_LAYERS_KEY,
  GAME_MAP_MARKER_KEY,
  loadMarkerSize,
  loadShownLayers,
  npcPoiKinds,
  saveMarkerSize,
  saveShownLayers,
  subzoneLevels,
  transportKind,
} from './game-map-pois';

describe('game map markers', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('tells what a creature is shown as from its NPC flags, trainer type and skill', () => {
    expect(npcPoiKinds(0x2000 | 0x10000, -1)).toEqual(['flight', 'inn']);
    expect(npcPoiKinds(0x8000, -1)).toEqual(['spirit']);
    expect(npcPoiKinds(0x10, 0)).toEqual(['classTrainer']);
    expect(npcPoiKinds(0x10, 1)).toEqual(['riding']);
    expect(npcPoiKinds(0x10, 2, 171)).toEqual(['prof:171']);
    expect(npcPoiKinds(0x10, 2, 999)).toEqual([]);
    expect(npcPoiKinds(0x10, 3)).toEqual([]);
    expect(npcPoiKinds(0, -1, 0, 'Barber')).toEqual(['barber']);
    expect(npcPoiKinds(0x80, -1, 0, 'Weapon Master')).toEqual(['weaponMaster']);
    expect(npcPoiKinds(0, -1, 0, 'Banker')).toEqual([]);
  });

  it('tells transports apart by name, and whose side a faction serves', () => {
    expect(transportKind('Zeppelin, Horde (The Purple Princess)')).toBe('zeppelin');
    expect(transportKind('Boat (The Bravery)')).toBe('boat');
    expect(transportKind('Alliance gunship patrol')).toBe('gunship');
    expect(transportKind("Orgrim's Hammer")).toBe('gunship');
    expect(transportKind('Deeprun Tram')).toBe('transport');
    const template = (ourMask: number, friendMask: number, enemyMask: number) => ({ ourMask, friendMask, enemyMask }) as FactionTemplate;
    expect(factionSide(template(2, 0, 4))).toBe('alliance');
    expect(factionSide(template(4, 0, 2))).toBe('horde');
    expect(factionSide(template(0, 6, 0))).toBeUndefined();
    expect(factionSide(template(2, 4, 4))).toBe('alliance');
    expect(factionSide(undefined)).toBeUndefined();
    // the badges: every side it is friendly to
    expect(friendlySides(template(0, 6, 0))).toEqual({ alliance: true, horde: true });
    expect(friendlySides(template(2, 4, 4))).toEqual({ alliance: true, horde: false });
    expect(friendlySides(undefined)).toEqual({ alliance: false, horde: false });
  });

  it('keeps the layers shown and the marker size on this computer', () => {
    expect(loadShownLayers().has('flight')).toBe(true);
    expect(loadShownLayers().has('spawns')).toBe(false);
    saveShownLayers(new Set(['bank', 'mailbox']));
    expect([...loadShownLayers()]).toEqual(['bank', 'mailbox']);
    localStorage.setItem(GAME_MAP_LAYERS_KEY, '{bad');
    expect(loadShownLayers().has('flight')).toBe(true);
    localStorage.setItem(GAME_MAP_LAYERS_KEY, '"flight"');
    expect(loadShownLayers().has('levels')).toBe(true);
    // a plain list (not what is kept): the defaults
    localStorage.setItem(GAME_MAP_LAYERS_KEY, '["bank"]');
    expect(loadShownLayers().has('flight')).toBe(true);
    localStorage.setItem(GAME_MAP_LAYERS_KEY, JSON.stringify({ shown: ['bank'], known: ['bank', 'flight'] }));
    expect(loadShownLayers().has('flight')).toBe(false);
    expect(loadShownLayers().has('levels')).toBe(true);
    localStorage.setItem(GAME_MAP_LAYERS_KEY, JSON.stringify({ shown: ['bank'] }));
    expect(loadShownLayers().has('bank')).toBe(false);

    expect(loadMarkerSize()).toBe(20);
    saveMarkerSize(26);
    expect(loadMarkerSize()).toBe(26);
    localStorage.setItem(GAME_MAP_MARKER_KEY, '7');
    expect(loadMarkerSize()).toBe(20);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => saveShownLayers(new Set())).not.toThrow();
    expect(() => saveMarkerSize(12)).not.toThrow();
    expect(loadMarkerSize()).toBe(20);
  });

  it("works out sub-zones' levels from the creatures spawned in them, as AoWoW does", () => {
    const spawn = (x: number, minLevel: number, maxLevel = minLevel, faction = 14) => ({ x, y: 0, minLevel, maxLevel, faction });
    const subzones = new Map([
      ['1', [[0, 0, 10, 0, 10, 10, 0, 10]]],
      ['2', [[20, 0, 30, 0, 30, 10, 20, 10]]],
    ]);
    const inBox = (x: number, y: number, rings: number[][]) => x >= rings[0][0] && x <= rings[0][2] && y >= 0 && y <= 10;
    const levels = subzoneLevels(
      [
        // area 1: ten spawns of 10-12, one boss of 60 (left out by the percentiles), one friendly, one outside the zone
        ...Array.from({ length: 10 }, (_, i) => spawn(5, 10 + (i % 3), 11 + (i % 3))),
        spawn(5, 60),
        spawn(5, 1, 1, 35),
        spawn(-5, 70),
        // area 2: only three; nowhere: one
        spawn(25, 20),
        spawn(25, 20),
        spawn(25, 20),
        spawn(50, 30),
      ],
      subzones,
      (s) => [s.x, 5],
      (s) => s.x >= 0,
      (faction) => faction === 35,
      inBox,
    );
    expect(levels).toEqual(new Map([['1', [10, 13]]]));
    // (a range upside down is put right)
    expect(
      subzoneLevels(
        [spawn(5, 9, 2), spawn(5, 9, 2), spawn(5, 9, 2), spawn(5, 9, 2)],
        subzones,
        (s) => [s.x, 5],
        () => true,
        () => false,
        inBox,
      ),
    ).toEqual(new Map([['1', [2, 9]]]));
  });
});
