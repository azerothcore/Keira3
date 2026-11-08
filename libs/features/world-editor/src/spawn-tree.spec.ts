import { WowZone } from '@keira/shared/wow-data';
import { buildSpawnTree, checkState, NO_ZONE, openableIds, setShown, treeMatcher, treeRows, zoneAt } from './spawn-tree';
import { SpawnRecord } from './world-editor.model';

const zone = (areaId: number, name: string, minX: number, maxX: number): WowZone => ({
  areaId,
  mapId: 1,
  name,
  bounds: { minX, maxX, minY: minX, maxY: maxX },
});
const ZONES = [zone(14, 'Durotar', 0, 1000), zone(1637, 'Orgrimmar', 100, 200)];
const spawn = (type: 'creature' | 'gameobject', guid: number, entry: number, name: string, at: number): SpawnRecord =>
  ({ type, guid, entry, name, map: 1, x: at, y: at, z: 0, o: 0, pathId: 0 }) as SpawnRecord;

describe('spawn tree', () => {
  it('matches words anywhere, wildcards whole, alternatives with |', () => {
    expect(treeMatcher('')('anything')).toBe(true);
    expect(treeMatcher('grunt')('Orgrimmar Grunt')).toBe(true);
    expect(treeMatcher('grunt')('Guard')).toBe(false);
    expect(treeMatcher('org*')('Orgrimmar Grunt')).toBe(true);
    expect(treeMatcher('*grunt')('Orgrimmar Grunt')).toBe(true);
    expect(treeMatcher('gr?nt')('grunt')).toBe(true);
    expect(treeMatcher('gr?nt')('a grunt')).toBe(false);
    expect(treeMatcher('(1).*')('(1).x')).toBe(true);
    expect(treeMatcher('guard | grunt')('Grunt')).toBe(true);
    expect(treeMatcher(' | ')('x')).toBe(true);
  });

  it('puts a spot in the smallest zone around it', () => {
    expect(zoneAt(ZONES, 150, 150)?.name).toBe('Orgrimmar');
    expect(zoneAt(ZONES, 500, 500)?.name).toBe('Durotar');
    expect(zoneAt(ZONES, 5000, 5000)).toBeUndefined();
    expect(zoneAt(ZONES, 500, 5000)).toBeUndefined();
  });

  it('groups by zone, type and entry, sorted by name, outside every zone last', () => {
    const spawns = [
      spawn('creature', 3, 3296, 'Orgrimmar Grunt', 150),
      spawn('creature', 2, 3296, 'Orgrimmar Grunt', 160),
      spawn('creature', 4, 3310, 'Doras', 170),
      spawn('gameobject', 9, 500, '', 150),
      spawn('creature', 5, 3100, 'Boar', 500),
      spawn('creature', 6, 1, 'Lost', 5000),
    ];
    const tree = buildSpawnTree(spawns, ZONES);
    expect(tree.map((node) => node.label)).toEqual(['Durotar', 'Orgrimmar', '']);
    expect(tree[2].id).toBe(NO_ZONE);
    const orgrimmar = tree[1];
    expect(orgrimmar.keys).toHaveLength(4);
    expect(orgrimmar.children.map((node) => node.label)).toEqual(['creature', 'gameobject']);
    const creatures = orgrimmar.children[0];
    expect(creatures.children.map((node) => node.label)).toEqual(['Doras (3310)', 'Orgrimmar Grunt (3296)']);
    expect(creatures.children[1].children.map((node) => node.label)).toEqual(['2', '3']);
    expect(creatures.children[1].children[0].spawn?.guid).toBe(2);
    expect(orgrimmar.children[1].children[0].label).toBe('? (500)');
    // (a zone without gameobjects has no gameobject node)
    expect(tree[0].children.map((node) => node.type)).toEqual(['creature']);
    // two zones outside any: the one with a name first either way
    expect(buildSpawnTree([spawns[5], spawns[4]], ZONES).map((node) => node.id)).toEqual(['zone:14', NO_ZONE]);
  });

  it('keeps what the filter matches by zone, name, entry or GUID', () => {
    const spawns = [
      spawn('creature', 3, 3296, 'Orgrimmar Grunt', 150),
      spawn('creature', 5, 3100, 'Boar', 500),
      spawn('creature', 6, 77, '', 5000),
    ];
    const keys = (filter: string) => buildSpawnTree(spawns, ZONES, filter).flatMap((node) => node.keys);
    expect(keys('durotar')).toEqual(['creature:5']);
    expect(keys('grunt')).toEqual(['creature:3']);
    expect(keys('3100')).toEqual(['creature:5']);
    expect(keys('5')).toEqual(['creature:5']);
    expect(keys('77')).toEqual(['creature:6']);
    expect(keys('nothing')).toEqual([]);
    expect(keys('  ')).toHaveLength(3);
  });

  it('lists the open rows, what can open, and the tick box states', () => {
    const tree = buildSpawnTree([spawn('creature', 3, 3296, 'Grunt', 150)], ZONES);
    expect(treeRows(tree, new Set()).map((row) => row.depth)).toEqual([0]);
    const all = openableIds(tree);
    expect(all).toEqual(['zone:1637', 'zone:1637:creature', 'zone:1637:creature:3296']);
    const rows = treeRows(tree, new Set(all));
    expect(rows.map((row) => [row.depth, row.open])).toEqual([
      [0, true],
      [1, true],
      [2, true],
      [3, false],
    ]);

    expect(checkState(['a', 'b'], new Set())).toBe('all');
    expect(checkState(['a', 'b'], new Set(['a']))).toBe('some');
    expect(checkState(['a', 'b'], new Set(['a', 'b']))).toBe('none');
    expect([...setShown(new Set(['a']), ['a', 'b'], false)]).toEqual(['a', 'b']);
    expect([...setShown(new Set(['a', 'c']), ['a', 'b'], true)]).toEqual(['c']);
  });
});
