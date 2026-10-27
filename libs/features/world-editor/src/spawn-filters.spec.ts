import { DEFAULT_SPAWN_FILTERS, isSpawnVisible, loadSpawnFilters, saveSpawnFilters, SPAWN_FILTERS_KEY, spawnEvents } from './spawn-filters';
import { SpawnRecord } from './world-editor.model';

const spawn = (overrides: Partial<SpawnRecord> = {}): SpawnRecord => ({
  type: 'creature',
  guid: 79,
  entry: 197,
  name: 'Marshal McBride',
  map: 0,
  x: 0,
  y: 0,
  z: 0,
  o: 0,
  pathId: 0,
  ...overrides,
});

describe('spawn filters', () => {
  afterEach(() => localStorage.removeItem(SPAWN_FILTERS_KEY));

  it('hides event spawns unless their event is shown', () => {
    expect(isSpawnVisible(spawn(), DEFAULT_SPAWN_FILTERS)).toBe(true);
    expect(isSpawnVisible(spawn({ event: 12 }), DEFAULT_SPAWN_FILTERS)).toBe(false);
    expect(isSpawnVisible(spawn({ event: 12 }), { ...DEFAULT_SPAWN_FILTERS, events: [12] })).toBe(true);
  });

  it('hides triggers unless asked', () => {
    expect(isSpawnVisible(spawn({ trigger: true }), DEFAULT_SPAWN_FILTERS)).toBe(false);
    expect(isSpawnVisible(spawn({ trigger: true }), { ...DEFAULT_SPAWN_FILTERS, showTriggers: true })).toBe(true);
  });

  it('can hide spawns outside phase 1', () => {
    const phase1Only = { ...DEFAULT_SPAWN_FILTERS, showOtherPhases: false };
    expect(isSpawnVisible(spawn({ phaseMask: 2 }), DEFAULT_SPAWN_FILTERS)).toBe(true);
    expect(isSpawnVisible(spawn({ phaseMask: 2 }), phase1Only)).toBe(false);
    expect(isSpawnVisible(spawn({ phaseMask: 3 }), phase1Only)).toBe(true);
    expect(isSpawnVisible(spawn(), phase1Only)).toBe(true);
  });

  it('searches the name, entry and guid', () => {
    const search = (text: string): boolean => isSpawnVisible(spawn(), { ...DEFAULT_SPAWN_FILTERS, search: text });
    expect(search(' marshal ')).toBe(true);
    expect(search('197')).toBe(true);
    expect(search('79')).toBe(true);
    expect(search('Hogger')).toBe(false);
  });

  it('lists the events of the spawns with their counts, by name', () => {
    const names = new Map([
      [12, "Hallow's End"],
      [1, 'Midsummer Fire Festival'],
    ]);
    expect(spawnEvents([spawn({ event: 1 }), spawn({ event: 12 }), spawn({ event: 1 }), spawn({ event: 99 }), spawn()], names)).toEqual([
      { id: 99, name: 'Event 99', spawns: 1 },
      { id: 12, name: "Hallow's End", spawns: 1 },
      { id: 1, name: 'Midsummer Fire Festival', spawns: 2 },
    ]);
  });

  it('saves and loads the filters, ignoring invalid values', () => {
    expect(loadSpawnFilters()).toEqual(DEFAULT_SPAWN_FILTERS);
    const filters = { events: [1, 12], showTriggers: true, showOtherPhases: false, search: 'bunny' };
    saveSpawnFilters(filters);
    expect(loadSpawnFilters()).toEqual(filters);

    localStorage.setItem(SPAWN_FILTERS_KEY, JSON.stringify({ events: [1, 'x'], showTriggers: 'yes', showOtherPhases: 0, search: 3 }));
    expect(loadSpawnFilters()).toEqual({ ...DEFAULT_SPAWN_FILTERS, events: [1] });
    localStorage.setItem(SPAWN_FILTERS_KEY, JSON.stringify({ events: 'all' }));
    expect(loadSpawnFilters()).toEqual(DEFAULT_SPAWN_FILTERS);
    localStorage.setItem(SPAWN_FILTERS_KEY, '{');
    expect(loadSpawnFilters()).toEqual(DEFAULT_SPAWN_FILTERS);
  });
});
