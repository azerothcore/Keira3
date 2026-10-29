import { GAME_MAP_POIS_KEY, loadShownPois, npcPoiKinds, saveShownPois } from './game-map-pois';

describe('game map points of interest', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('tells what a creature is shown as from its NPC flags and trainer type', () => {
    expect(npcPoiKinds(0x2000 | 0x10000, -1)).toEqual(['flight', 'inn']);
    expect(npcPoiKinds(0x8000, -1)).toEqual(['spirit']);
    expect(npcPoiKinds(0x10, 0)).toEqual(['classTrainer']);
    expect(npcPoiKinds(0x10, 2)).toEqual(['professionTrainer']);
    expect(npcPoiKinds(0x10, 3)).toEqual([]);
  });

  it('keeps the kinds shown on this computer, the default ones at first', () => {
    expect([...loadShownPois()]).toEqual(['flight', 'inn', 'spirit']);
    saveShownPois(new Set(['bank', 'mailbox']));
    expect([...loadShownPois()]).toEqual(['bank', 'mailbox']);
    localStorage.setItem(GAME_MAP_POIS_KEY, '{bad');
    expect(loadShownPois().has('flight')).toBe(true);
    localStorage.setItem(GAME_MAP_POIS_KEY, '"flight"');
    expect(loadShownPois().size).toBe(3);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(() => saveShownPois(new Set())).not.toThrow();
  });
});
