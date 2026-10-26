import { DbcFile, isDefaultCharacterGeoset, parseZones, parseCreatureDisplays, parseGameObjectDisplays, parseMapDbc } from './dbc';
import { buildDbc } from './dbc.mock';

describe('DbcFile', () => {
  it('reads integer, float and string fields', () => {
    const floatBits = new DataView(new ArrayBuffer(4));
    floatBits.setFloat32(0, 1.5, true);
    const dbc = new DbcFile(buildDbc([[7, 'Hello', 0xffffffff, floatBits.getUint32(0, true)]]));

    expect(dbc.recordCount).toBe(1);
    expect(dbc.fieldCount).toBe(4);
    expect(dbc.recordSize).toBe(16);
    expect(dbc.getUint(0, 0)).toBe(7);
    expect(dbc.getString(0, 1)).toBe('Hello');
    expect(dbc.getInt(0, 2)).toBe(-1);
    expect(dbc.getFloat(0, 3)).toBe(1.5);
  });

  it('reads a string running to the end of the file', () => {
    const bytes = buildDbc([[1, 'abc']]);
    const truncatedTerminator = bytes.slice(0, bytes.length - 1);
    const view = new DataView(truncatedTerminator.buffer);
    view.setUint32(16, view.getUint32(16, true) - 1, true);
    expect(new DbcFile(truncatedTerminator).getString(0, 1)).toBe('abc');
  });

  it('rejects files that are not WDBC', () => {
    expect(() => new DbcFile(new TextEncoder().encode('WDB2' + '\0'.repeat(16)))).toThrowError(/Not a WDBC file/);
  });

  it('rejects truncated files', () => {
    const bytes = buildDbc([[1, 'abc']]);
    expect(() => new DbcFile(bytes.slice(0, bytes.length - 2))).toThrowError('Truncated WDBC file');
  });

  it('builds an empty file', () => {
    expect(new DbcFile(buildDbc([])).recordCount).toBe(0);
  });
});

describe('parseMapDbc', () => {
  const row = (id: number, directory: string, instanceType: number, nameField: number, name: string): (number | string)[] => {
    const fields: (number | string)[] = new Array(22).fill(0);
    fields[0] = id;
    fields[1] = directory;
    fields[2] = instanceType;
    fields[nameField] = name;
    return fields;
  };

  it('reads id, directory, instance type and the first non-empty localized name, sorted by id', () => {
    const dbc = new DbcFile(
      buildDbc([
        row(571, 'Northrend', 0, 5, 'Northrend'),
        row(0, 'Azeroth', 0, 7, 'Royaumes de l’Est'),
        row(36, 'DeadminesInstance', 1, 21, 'ignored'),
      ]),
    );
    expect(parseMapDbc(dbc)).toEqual([
      { id: 0, directory: 'Azeroth', name: 'Royaumes de l’Est', instanceType: 0 },
      { id: 36, directory: 'DeadminesInstance', name: 'DeadminesInstance', instanceType: 1 },
      { id: 571, directory: 'Northrend', name: 'Northrend', instanceType: 0 },
    ]);
  });
});

const float = (value: number): number => {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getUint32(0, true);
};
const dbcOf = (rows: (number | string)[][], fieldCount?: number) => new DbcFile(buildDbc(rows, fieldCount));

describe('parseCreatureDisplays', () => {
  const models = dbcOf([
    [1, 0, 'Creature\\Wolf\\Wolf.mdx', 0, float(1.5)],
    [2, 0, 'Character\\Human\\Male\\HumanMale.mdx', 0, 0],
    [3, 0, '', 0, 0],
  ]);
  const displays = dbcOf(
    [
      [10, 1, 0, 0, float(2), 0, 'WolfGrey', '', 'WolfEyes'],
      [11, 2, 0, 50, 0],
      [12, 2, 0, 51, 0],
      [13, 3, 0, 0, 0],
      [14, 99, 0, 0, 0],
    ],
    9,
  );

  it('resolves creature models, sizes and skin textures', () => {
    const parsed = parseCreatureDisplays({ displays, models });
    expect(parsed.get(10)).toEqual({
      model: 'Creature\\Wolf\\Wolf.mdx',
      scale: 3,
      textures: { 11: 'Creature\\Wolf\\WolfGrey.blp', 13: 'Creature\\Wolf\\WolfEyes.blp' },
    });
    // without the character DBCs, humanoids keep their bare model
    expect(parsed.get(11)).toEqual({ model: 'Character\\Human\\Male\\HumanMale.mdx', scale: 1, textures: {} });
    expect(parsed.has(13)).toBe(false);
    expect(parsed.has(14)).toBe(false);
  });

  it('dresses humanoid NPCs with their baked texture, hair style and hair colour', () => {
    const extras = dbcOf(
      [
        [50, 1, 0, 0, 0, 4, 2, ...new Array(13).fill(0), 'HumanMaleGuard.blp'],
        [51, 1, 0, 0, 0, 7, 0, ...new Array(13).fill(0), ''],
      ],
      21,
    );
    const hairGeosets = dbcOf([
      [1, 1, 0, 4, 5],
      [2, 1, 0, 9, 10],
    ]);
    const charSections = dbcOf(
      [
        [1, 1, 0, 3, 'Character\\Human\\Hair04_02.blp', '', '', 0, 4, 2],
        [2, 1, 0, 3, 'Character\\Human\\Other.blp', '', '', 0, 4, 2],
        [3, 1, 0, 0, 'Character\\Human\\Skin.blp', '', '', 0, 4, 2],
        [4, 1, 0, 3, '', '', '', 0, 7, 0],
      ],
      10,
    );
    const parsed = parseCreatureDisplays({ displays, models, extras, hairGeosets, charSections });
    expect(parsed.get(11)).toEqual({
      model: 'Character\\Human\\Male\\HumanMale.mdx',
      scale: 1,
      textures: { 1: 'Textures\\BakedNpcTextures\\HumanMaleGuard.blp', 6: 'Character\\Human\\Hair04_02.blp' },
      hairGeoset: 5,
    });
    expect(parsed.get(12)).toEqual({ model: 'Character\\Human\\Male\\HumanMale.mdx', scale: 1, textures: {}, hairGeoset: 1 });
  });
});

describe('parseGameObjectDisplays', () => {
  it('maps display ids to model paths', () => {
    const parsed = parseGameObjectDisplays(
      dbcOf([
        [1, 'World\\Generic\\Mailbox.mdx'],
        [2, ''],
      ]),
    );
    expect([...parsed]).toEqual([[1, 'World\\Generic\\Mailbox.mdx']]);
  });
});

describe('isDefaultCharacterGeoset', () => {
  it('keeps the body, the hair style and the default of each other group', () => {
    expect(isDefaultCharacterGeoset(0, 5)).toBe(true);
    expect(isDefaultCharacterGeoset(5, 5)).toBe(true);
    expect(isDefaultCharacterGeoset(3, 5)).toBe(false);
    expect(isDefaultCharacterGeoset(401, 5)).toBe(true);
    expect(isDefaultCharacterGeoset(402, 5)).toBe(false);
  });
});

describe('parseZones', () => {
  it('lists the zones of the world map with their bounds and names', () => {
    const zone = (id: number, map: number, area: number, name: string, bounds: number[]) => [id, map, area, name, ...bounds.map(float)];
    const areas = dbcOf([
      zone(14, 0, 0, 'Azeroth', [18172, -22569, 11176, -15973]),
      zone(30, 0, 12, 'Elwynn', [1535, -1110, -7856, -10213]),
      zone(31, 0, 40, 'Westfall', [500, -2000, -9000, -12000]),
      zone(32, 1, 99, 'Nowhere', [1, 0, 1, 0]),
    ]);
    const names = dbcOf([[12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 'Elwynn Forest']], 27);
    expect(parseZones(areas, names)).toEqual([
      { areaId: 12, mapId: 0, name: 'Elwynn Forest', bounds: { minX: -10213, maxX: -7856, minY: -1110, maxY: 1535 } },
      { areaId: 99, mapId: 1, name: 'Nowhere', bounds: { minX: 0, maxX: 1, minY: 0, maxY: 1 } },
      { areaId: 40, mapId: 0, name: 'Westfall', bounds: { minX: -12000, maxX: -9000, minY: -2000, maxY: 500 } },
    ]);
    expect(parseZones(areas).map((z) => z.name)).toEqual(['Elwynn', 'Nowhere', 'Westfall']);
  });
});
