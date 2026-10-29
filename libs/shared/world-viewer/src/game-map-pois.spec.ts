import { FactionTemplate } from '@keira/shared/wow-data';
import {
  factionSide,
  GAME_MAP_LAYERS_KEY,
  GAME_MAP_MARKER_KEY,
  loadMarkerSize,
  loadShownLayers,
  npcPoiKinds,
  saveMarkerSize,
  saveShownLayers,
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
  });

  it('tells transports apart by name, and whose side a faction serves', () => {
    expect(transportKind('Zeppelin, Horde (The Purple Princess)')).toBe('zeppelin');
    expect(transportKind('Boat (The Bravery)')).toBe('boat');
    expect(transportKind('Alliance gunship patrol')).toBe('transport');
    expect(transportKind('Deeprun Tram')).toBe('transport');
    const template = (ourMask: number, friendMask: number, enemyMask: number) => ({ ourMask, friendMask, enemyMask }) as FactionTemplate;
    expect(factionSide(template(2, 0, 4))).toBe('alliance');
    expect(factionSide(template(4, 0, 2))).toBe('horde');
    expect(factionSide(template(0, 6, 0))).toBeUndefined();
    expect(factionSide(template(2, 4, 4))).toBe('alliance');
    expect(factionSide(undefined)).toBeUndefined();
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
});
