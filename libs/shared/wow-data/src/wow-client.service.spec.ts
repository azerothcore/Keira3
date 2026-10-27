import { TestBed } from '@angular/core/testing';
import { buildDbc } from './dbc.mock';
import { EMPTY_COLLISION } from './collision';
import { WowClientService } from './wow-client.service';
import { WowDataCacheService } from './wow-data-cache.service';
import { WowDataSettingsService } from './wow-data-settings.service';
import { WOW_NATIVE_API } from './wow-native-api';
import { createFakeNative, FakeMpq, FakeNative } from './wow-native-api.mock';

const formats = vi.hoisted(() => ({
  parseAdt: vi.fn(),
  parseWdt: vi.fn(),
  decodeBlp: vi.fn(),
}));
vi.mock('./formats', () => formats);

const wmo = vi.hoisted(() => ({
  parseWmoRoot: vi.fn(),
  parseWmoGroup: vi.fn(),
  parseWmoDoodads: vi.fn(),
  wmoDoodadPlacements: vi.fn(),
  wmoGroupPath: (root: string, i: number) => `${root.replace(/\.wmo$/i, '')}_${String(i).padStart(3, '0')}.wmo`,
}));
vi.mock('./wmo', () => wmo);

const m2 = vi.hoisted(() => ({
  parseM2: vi.fn(),
  m2Path: (path: string) => path.replace(/\.mdx$/i, '.m2'),
  m2SkinPath: (path: string) => path.replace(/\.(mdx|m2)$/i, '00.skin'),
}));
vi.mock('./m2', () => m2);

const adtOf = (chunks: unknown[] = [], wmos: unknown[] = [], doodads: unknown[] = []) => ({ chunks, wmos, doodads });

const mapDbc = (directory: string): number[] => {
  const row: (number | string)[] = new Array(22).fill(0);
  row[0] = 1;
  row[1] = directory;
  row[5] = `${directory} name`;
  return Array.from(buildDbc([row]));
};

describe('WowClientService', () => {
  const setup = (
    opts: {
      files?: Record<string, number[]>;
      mpqs?: Record<string, FakeMpq>;
      native?: boolean;
      clientPath?: string;
      serverDataPath?: string;
    } = {},
  ) => {
    localStorage.clear();
    const native: FakeNative = createFakeNative(opts.files ?? {}, opts.mpqs ?? {}, '/wow/Data');
    TestBed.configureTestingModule({ providers: [{ provide: WOW_NATIVE_API, useValue: opts.native === false ? undefined : native }] });
    const settings = TestBed.inject(WowDataSettingsService);
    settings.save({ clientPath: opts.clientPath ?? '/wow', serverDataPath: opts.serverDataPath ?? '' });
    return { service: TestBed.inject(WowClientService), native, settings };
  };

  const standardMpqs = (): Record<string, FakeMpq> => ({
    'common.MPQ': { files: { 'a.txt': [1], 'World\\Maps\\Azeroth\\Azeroth.wdt': [9] } },
    'patch.MPQ': { files: { 'a.txt': [2] } },
    'enUS/locale-enUS.MPQ': { files: { 'DBFilesClient\\Map.dbc': mapDbc('ClientMap') } },
  });

  afterEach(() => vi.clearAllMocks());

  it('is not supported outside Electron', async () => {
    const { service } = setup({ native: false });
    expect(service.isSupported()).toBe(false);
    await expect(service.readFile('x')).rejects.toThrowError(/only available in the Keira3 desktop app/);
    await expect(service.getMaps()).rejects.toThrowError(/only available in the Keira3 desktop app/);
  });

  it('requires a client path', async () => {
    const { service } = setup({ clientPath: '' });
    expect(service.isSupported()).toBe(true);
    await expect(service.readFile('x')).rejects.toThrowError(/Set the WoW client folder/);
  });

  it('requires a Data folder', async () => {
    const { service } = setup({ clientPath: '/elsewhere' });
    await expect(service.readFile('x')).rejects.toThrowError(
      'No "Data" folder found in /elsewhere. Pick the folder that contains Wow.exe.',
    );
  });

  it('requires recognised archives', async () => {
    const { service } = setup({ files: { '/wow/Data/foo.txt': [] } });
    await expect(service.readFile('x')).rejects.toThrowError('No WoW 3.3.5a MPQ archives found in /wow/Data.');
  });

  it('fails when no archive can be opened, and retries on the next call', async () => {
    const { service, native } = setup({ mpqs: { 'common.MPQ': { fail: true } } });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(service.readFile('x')).rejects.toThrowError('None of the MPQ archives in /wow/Data could be opened.');
    expect(warn).toHaveBeenCalledWith('[World Editor] Skipping common.MPQ: Archive could not be opened (error 31)');
    expect(native.mounts.size).toBe(0);
    await expect(service.readFile('x')).rejects.toThrowError(/None of the MPQ archives/);
  });

  it('opens archives in priority order, including folder archives, and skips broken ones', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { service } = setup({
      files: { '/wow/Data/enUS/patch-enUS-y.mpq/A.TXT': [3] },
      mpqs: { ...standardMpqs(), 'patch-2.MPQ': { fail: true } },
    });

    expect(await service.getArchiveNames()).toEqual(['common.MPQ', 'patch.MPQ', 'enUS/locale-enUS.MPQ', 'enUS/patch-enUS-y.mpq']);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(Array.from((await service.readFile('a.txt')) as Uint8Array)).toEqual([3]);
    // the archive's buffer is released on close; the returned bytes must survive that
    expect(Array.from((await service.readFile('World\\Maps\\Azeroth\\Azeroth.wdt')) as Uint8Array)).toEqual([9]);
    expect(await service.readFile('missing')).toBeUndefined();
  });

  it('uses the locale configured in WTF/Config.wtf', async () => {
    const { service } = setup({
      files: { '/wow/WTF/Config.wtf': Array.from(new TextEncoder().encode('SET locale "deDE"')) },
      mpqs: { ...standardMpqs(), 'deDE/locale-deDE.MPQ': { files: {} } },
    });
    expect(await service.getArchiveNames()).toEqual(['common.MPQ', 'patch.MPQ', 'deDE/locale-deDE.MPQ']);
  });

  it('works without any locale folder', async () => {
    const { service } = setup({ mpqs: { 'common.MPQ': { files: {} } } });
    expect(await service.getArchiveNames()).toEqual(['common.MPQ']);
  });

  it('reuses the open client and reopens it when the client path changes', async () => {
    const { service, settings, native } = setup({ mpqs: standardMpqs() });
    await service.readFile('a.txt');
    await service.readFile('a.txt');
    expect(native.openedArchives.length).toBe(3);

    settings.save({ clientPath: '/other', serverDataPath: '' });
    await expect(service.readFile('a.txt')).rejects.toThrowError(/No "Data" folder/);
    expect(native.openedArchives.every((archive) => archive.closed)).toBe(true);
  });

  it('closes archives and unmounts', async () => {
    const { service, native } = setup({ mpqs: standardMpqs() });
    await service.close();
    await service.readFile('a.txt');
    expect(native.mounts.size).toBe(1);
    await service.close();
    expect(native.mounts.size).toBe(0);
    expect(native.openedArchives.every((archive) => archive.closed)).toBe(true);
  });

  it('closes cleanly after a failed open', async () => {
    const { service } = setup({ clientPath: '' });
    const pending = service.readFile('x').catch(() => undefined);
    await service.close();
    await pending;
  });

  describe('maps', () => {
    it('reads Map.dbc from the server data folder when present', async () => {
      const { service } = setup({ files: { '/srv/dbc/Map.dbc': mapDbc('ServerMap') }, mpqs: standardMpqs(), serverDataPath: '/srv' });
      expect(await service.getMaps()).toEqual([{ id: 1, directory: 'ServerMap', name: 'ServerMap name', instanceType: 0 }]);
      expect(await service.getMaps()).toBe(await service.getMaps());
    });

    it('falls back to the client when the server has no Map.dbc', async () => {
      const { service } = setup({ mpqs: standardMpqs(), serverDataPath: '/srv' });
      expect((await service.getMaps())[0].directory).toBe('ClientMap');
    });

    it('fails when Map.dbc is nowhere, and retries next time', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: {} } } });
      await expect(service.getMaps()).rejects.toThrowError('Map.dbc not found in the client or server data.');
      await expect(service.getMaps()).rejects.toThrowError('Map.dbc not found in the client or server data.');
    });
  });

  describe('displays', () => {
    const dbc = (rows: (number | string)[][], fieldCount?: number) => Array.from(buildDbc(rows, fieldCount));
    const displayMpqs = (files: Record<string, number[]>): Record<string, FakeMpq> => ({ 'common.MPQ': { files } });

    it('resolves creature displays from the client, with the server DBCs taking precedence', async () => {
      const { service } = setup({
        files: { '/srv/dbc/CreatureModelData.dbc': dbc([[1, 0, 'Creature\\Wolf\\Wolf.mdx', 0, 0]]) },
        mpqs: displayMpqs({
          'DBFilesClient\\CreatureDisplayInfo.dbc': dbc([[10, 1, 0, 0, 0, 0, 'WolfGrey', '', '']], 9),
          'DBFilesClient\\CreatureModelData.dbc': dbc([[1, 0, 'Creature\\Wrong.mdx', 0, 0]]),
        }),
        serverDataPath: '/srv',
      });
      expect(await service.getCreatureDisplay(10)).toEqual({
        model: 'Creature\\Wolf\\Wolf.mdx',
        scale: 1,
        textures: { 11: 'Creature\\Wolf\\WolfGrey.blp' },
      });
      expect(await service.getCreatureDisplay(11)).toBeUndefined();
    });

    it('retries creature displays after a failure', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\CreatureDisplayInfo.dbc': [1, 2, 3, 4] }) });
      await expect(service.getCreatureDisplay(10)).rejects.toThrowError(/WDBC/);
      await expect(service.getCreatureDisplay(10)).rejects.toThrowError(/WDBC/);
    });

    it('has no displays without their DBCs', async () => {
      const { service } = setup({ mpqs: displayMpqs({}) });
      expect(await service.getCreatureDisplay(10)).toBeUndefined();
      expect(await service.getGameObjectDisplay(5)).toBeUndefined();
    });

    it('resolves gameobject displays', async () => {
      const { service } = setup({
        mpqs: displayMpqs({ 'DBFilesClient\\GameObjectDisplayInfo.dbc': dbc([[5, 'World\\Generic\\Mailbox.mdx']]) }),
      });
      expect(await service.getGameObjectDisplay(5)).toBe('World\\Generic\\Mailbox.mdx');
      expect(await service.getGameObjectDisplay(6)).toBeUndefined();
    });

    it('reads the zone lights of a map by its directory', async () => {
      const row = (id: number, map: number) => [id, map, 0, 0, 0, 0, 0, 1];
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\Map.dbc': mapDbc('Azeroth'),
          'DBFilesClient\\Light.dbc': dbc([row(1, 1), row(2, 5)]),
          'DBFilesClient\\LightIntBand.dbc': dbc([[1, 0]], 34),
          'DBFilesClient\\LightFloatBand.dbc': dbc([[1, 0]], 34),
        }),
      });
      expect((await service.getZoneLights('azeroth')).map((light) => light.id)).toEqual([1]);
      expect(await service.getZoneLights('Unknown')).toEqual([]);
    });

    it('has no zone lights without their DBCs, and retries after a failure', async () => {
      const { service } = setup({
        mpqs: displayMpqs({ 'DBFilesClient\\Map.dbc': mapDbc('Azeroth'), 'DBFilesClient\\LightIntBand.dbc': [1, 2, 3, 4] }),
      });
      await expect(service.getZoneLights('Azeroth')).rejects.toThrowError(/WDBC/);
      await expect(service.getZoneLights('Azeroth')).rejects.toThrowError(/WDBC/);
    });

    it('lists the zones of a map', async () => {
      const float = (value: number) => new Uint32Array(new Float32Array([value]).buffer)[0];
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\WorldMapArea.dbc': dbc([
            [30, 0, 12, 'Elwynn', float(1), float(0), float(1), float(0)],
            [31, 1, 14, 'Durotar', float(1), float(0), float(1), float(0)],
          ]),
        }),
      });
      expect((await service.getZones(0)).map((zone) => zone.name)).toEqual(['Elwynn']);
      expect((await service.getZones(1)).map((zone) => zone.name)).toEqual(['Durotar']);
    });

    it('lists the area triggers of a map', async () => {
      const float = (value: number) => new Uint32Array(new Float32Array([value]).buffer)[0];
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\AreaTrigger.dbc': dbc([
            [45, 0, float(1), float(2), float(3), float(5), 0, 0, 0, 0],
            [46, 1, float(1), float(2), float(3), 0, float(10), float(4), float(6), float(1.5)],
          ]),
        }),
      });
      expect(await service.getAreaTriggers(0)).toEqual([{ id: 45, mapId: 0, x: 1, y: 2, z: 3, radius: 5 }]);
      expect((await service.getAreaTriggers(1))[0].box).toEqual({ length: 10, width: 4, height: 6, orientation: 1.5 });
    });

    it('retries area triggers after a failure', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\AreaTrigger.dbc': [1, 2, 3, 4] }) });
      await expect(service.getAreaTriggers(0)).rejects.toThrowError(/WDBC/);
      await expect(service.getAreaTriggers(0)).rejects.toThrowError(/WDBC/);
    });

    it('has no area triggers without the DBC', async () => {
      const { service } = setup({ mpqs: displayMpqs({}) });
      expect(await service.getAreaTriggers(0)).toEqual([]);
    });

    it('has no zones without the world map DBC, and retries after a failure', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\AreaTable.dbc': [1, 2, 3, 4] }) });
      await expect(service.getZones(0)).rejects.toThrowError(/WDBC/);
      await expect(service.getZones(0)).rejects.toThrowError(/WDBC/);
    });

    it('has no zones when the world map DBC is missing', async () => {
      const { service } = setup({ mpqs: displayMpqs({}) });
      expect(await service.getZones(0)).toEqual([]);
    });

    it('has no zone lights for a map without lights', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\Map.dbc': mapDbc('Azeroth') }) });
      expect(await service.getZoneLights('Azeroth')).toEqual([]);
    });

    it('retries gameobject displays after a failure', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\GameObjectDisplayInfo.dbc': [1, 2, 3, 4] }) });
      await expect(service.getGameObjectDisplay(5)).rejects.toThrowError(/WDBC/);
      await expect(service.getGameObjectDisplay(5)).rejects.toThrowError(/WDBC/);
    });
  });

  describe('terrain', () => {
    it('lists map tiles from the WDT', async () => {
      const { service } = setup({ mpqs: standardMpqs() });
      formats.parseWdt.mockReturnValue({ tiles: [{ tx: 1, ty: 2 }], layerSplatDepth: 4 });
      expect(await service.getMapTiles('Azeroth')).toEqual([{ tx: 1, ty: 2 }]);
      expect(await service.getMapTiles('azeroth')).toEqual([{ tx: 1, ty: 2 }]);
      expect(formats.parseWdt).toHaveBeenCalledTimes(1);
      expect(Array.from(formats.parseWdt.mock.calls[0][0])).toEqual([9]);
      expect(await service.getMapTiles('Nowhere')).toEqual([]);
    });

    it('builds terrain meshes from ADTs with the alpha depth of the WDT', async () => {
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: {
              'World\\Maps\\Azeroth\\Azeroth.wdt': [9],
              'World\\Maps\\Azeroth\\Azeroth_32_48.adt': [1],
              'World\\Maps\\NoWdt\\NoWdt_1_1.adt': [1],
            },
          },
        },
      });
      formats.parseWdt.mockReturnValue({ tiles: [], layerSplatDepth: 8 });
      formats.parseAdt.mockReturnValue(adtOf());
      const mesh = await service.getTerrain('Azeroth', { tx: 32, ty: 48 });
      expect(mesh?.tile).toEqual({ tx: 32, ty: 48 });
      expect(formats.parseAdt.mock.calls[0][1]).toBe(8);
      expect(await service.getTerrain('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();

      await service.getTerrain('NoWdt', { tx: 1, ty: 1 });
      expect(formats.parseAdt.mock.calls[1][1]).toBe(4);
    });

    it('builds textured terrain and liquids from ADTs', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\Azeroth\\Azeroth_32_48.adt': [1, 2, 3, 4, 0, 0, 0, 0] } } },
      });
      formats.parseWdt.mockReturnValue({ tiles: [], layerSplatDepth: 4 });
      formats.parseAdt.mockReturnValue(adtOf([{ position: [0, 0, 0], vertexHeights: [], holes: 0, layers: [{ texture: 'a.blp' }] }]));
      const detail = await service.getTerrainDetail('Azeroth', { tx: 32, ty: 48 });
      expect(detail?.chunks[0].textures).toEqual(['a.blp']);
      expect(detail?.liquids).toEqual([]);
      expect(await service.getTerrainDetail('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();
    });

    it('lists placements and shares one ADT parse between terrain, liquids and placements', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\Azeroth\\Azeroth_32_48.adt': [1, 2, 3, 4, 0, 0, 0, 0] } } },
      });
      formats.parseWdt.mockReturnValue({ tiles: [], layerSplatDepth: 4 });
      formats.parseAdt.mockReturnValue(adtOf([], [{ uniqueId: 1, path: 'Inn.wmo' }], [{ uniqueId: 2 }]));
      const tile = { tx: 32, ty: 48 };
      expect(await service.getTilePlacements('Azeroth', tile)).toEqual({
        wmos: [{ uniqueId: 1, path: 'Inn.wmo' }],
        doodads: [{ uniqueId: 2 }],
      });
      await service.getTerrain('Azeroth', tile);
      await service.getTerrainDetail('azeroth', tile);
      expect(formats.parseAdt).toHaveBeenCalledTimes(1);
      expect(await service.getTilePlacements('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();
    });

    it('keeps only the most recent parsed ADTs, and retries failed ones', async () => {
      const files: Record<string, number[]> = {};
      for (let i = 0; i < 34; i++) {
        files[`World\\Maps\\M\\M_${i}_0.adt`] = [0, 0, 0, 0, 0, 0, 0, 0];
      }
      const { service } = setup({ mpqs: { 'common.MPQ': { files } } });
      // (without the disk cache, which would serve evicted tiles)
      TestBed.inject(WowDataCacheService).setEnabled(false);
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(adtOf());
      for (let i = 0; i < 34; i++) {
        await service.getTilePlacements('M', { tx: i, ty: 0 });
      }
      await service.getTilePlacements('M', { tx: 33, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(34);
      await service.getTilePlacements('M', { tx: 0, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(35);

      formats.parseAdt.mockImplementationOnce(() => {
        throw new Error('bad adt');
      });
      await expect(service.getTilePlacements('M', { tx: 1, ty: 0 })).rejects.toThrowError('bad adt');
      await service.getTilePlacements('M', { tx: 1, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(37);
    });

    it('loads buildings with their existing groups', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\wmo\\A.wmo': [1], 'World\\wmo\\A_000.wmo': [2], 'World\\wmo\\A_002.wmo': [3] } } },
      });
      wmo.parseWmoRoot.mockReturnValue({
        flags: 4,
        materials: [{ texture: 't.blp' }],
        groups: [{ indoor: true }, { indoor: false }, { indoor: false }],
      });
      wmo.parseWmoGroup.mockImplementation((_b: Uint8Array, flags: number, indoor: boolean) => ({ flags, indoor }));
      expect(await service.getWmo('World\\wmo\\A.wmo')).toEqual({
        materials: [{ texture: 't.blp' }],
        groups: [
          { flags: 4, indoor: true, collision: EMPTY_COLLISION },
          { flags: 4, indoor: false, collision: EMPTY_COLLISION },
        ],
      });
      expect(await service.getWmo('missing.wmo')).toBeUndefined();
    });

    it('reads a building again when its cached groups have no collision yet', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: { 'World\\wmo\\A.wmo': [1], 'World\\wmo\\A_000.wmo': [2] } } } });
      const cache = TestBed.inject(WowDataCacheService);
      await service.getMaps().catch(() => undefined);
      wmo.parseWmoRoot.mockReturnValue({ flags: 0, materials: [], groups: [{ indoor: false }] });
      wmo.parseWmoGroup.mockReturnValue({ indoor: false });
      const write = vi.spyOn(cache, 'read').mockReturnValueOnce({ materials: [], groups: [{ indoor: false }] });
      expect((await service.getWmo('World\\wmo\\A.wmo'))?.groups[0].collision).toEqual(EMPTY_COLLISION);
      expect(wmo.parseWmoRoot).toHaveBeenCalled();
      write.mockRestore();
    });

    it('loads models with their skin, reading .mdx names as .m2', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Tree.m2': [1], 'World\\Tree00.skin': [2], 'World\\NoSkin.m2': [3] } } },
      });
      m2.parseM2.mockImplementation((model: Uint8Array, skin: Uint8Array) => ({ model: model[0], skin: skin[0] }));
      expect(await service.getM2('World\\Tree.mdx')).toEqual({ model: 1, skin: 2 });
      expect(await service.getM2('World\\NoSkin.m2')).toBeUndefined();
      expect(await service.getM2('World\\Missing.m2')).toBeUndefined();
    });

    it('keeps parsed models in the disk cache', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Tree.m2': [1], 'World\\Tree00.skin': [2] } } },
      });
      // a model cached before collisions were kept is parsed again
      m2.parseM2.mockReturnValueOnce({ model: 0 });
      await service.getM2('World\\Tree.mdx');
      await service.close();
      m2.parseM2.mockImplementation((model: Uint8Array, skin: Uint8Array) => ({
        model: model[0],
        skin: skin[0],
        collision: EMPTY_COLLISION,
      }));
      await service.getM2('World\\Tree.mdx');
      expect(m2.parseM2).toHaveBeenCalledTimes(2);
      expect((await service.cacheUsage()).modelBytes).toBeGreaterThan(0);
      await service.close();
      m2.parseM2.mockClear();
      expect(await service.getM2('World\\Tree.mdx')).toEqual({ model: 1, skin: 2, collision: EMPTY_COLLISION });
      expect(m2.parseM2).not.toHaveBeenCalled();
    });

    it('adds the doodads inside the buildings of a tile to its doodads, reading each building once', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\M\\M_1_1.adt': [1], 'Inn.wmo': [1] } } },
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(
        adtOf(
          [],
          [
            { uniqueId: 1, path: 'Inn.wmo', doodadSet: 0 },
            { uniqueId: 2, path: 'INN.wmo', doodadSet: 1 },
            { uniqueId: 3, path: 'Missing.wmo', doodadSet: 0 },
            { uniqueId: 4, path: 'Broken.wmo', doodadSet: 0 },
          ],
          [{ uniqueId: 9 }],
        ),
      );
      const info = { sets: [{ start: 0, count: 1 }], doodads: [{ path: 'Barrel.mdx' }] };
      wmo.parseWmoDoodads.mockReturnValueOnce(info);
      wmo.wmoDoodadPlacements.mockImplementation((building: { uniqueId: number }) => [{ uniqueId: -building.uniqueId }]);
      const read = vi.spyOn(service, 'readFile');
      read.mockImplementation((path: string) =>
        path === 'Broken.wmo'
          ? Promise.reject(new Error('bad archive'))
          : Promise.resolve(path === 'Missing.wmo' ? undefined : new Uint8Array([1])),
      );

      const placements = await service.getTilePlacements('M', { tx: 1, ty: 1 });
      expect(placements?.doodads).toEqual([{ uniqueId: 9 }, { uniqueId: -1 }, { uniqueId: -2 }]);
      expect(wmo.parseWmoDoodads).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith('[World Editor] Could not read the doodads of Broken.wmo: bad archive');

      // from the disk cache after a restart; a failed building is tried again
      await service.close();
      wmo.parseWmoDoodads.mockClear();
      await service.getTilePlacements('M', { tx: 1, ty: 1 });
      expect(wmo.parseWmoDoodads).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledTimes(2);
      warn.mockRestore();
    });

    it('parses again tiles cached before buildings kept their doodad set', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: { 'World\\Maps\\M\\M_1_1.adt': [1] } } } });
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(adtOf([], [{ uniqueId: 1, path: 'Inn.wmo' }]));
      await service.getTerrain('M', { tx: 1, ty: 1 });
      await service.close();
      formats.parseAdt.mockClear();
      await service.getTerrain('M', { tx: 1, ty: 1 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(1);
    });

    it('keeps parsed tiles and buildings in the disk cache, per client', async () => {
      const { service, native } = setup({
        mpqs: {
          'common.MPQ': {
            files: { 'World\\Maps\\M\\M_1_2.adt': [1], 'World\\wmo\\A.wmo': [1], 'World\\wmo\\A_000.wmo': [2] },
          },
        },
      });
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(adtOf([], [{ uniqueId: 1, path: 'World\\wmo\\A.wmo', doodadSet: 0 }]));
      wmo.parseWmoRoot.mockReturnValue({ flags: 0, materials: [], groups: [{ indoor: false }] });
      wmo.parseWmoGroup.mockReturnValue({ indoor: false });

      expect((await service.getTilePlacements('M', { tx: 1, ty: 2 }))?.wmos).toHaveLength(1);
      expect(await service.getWmo('World\\wmo\\A.wmo')).toEqual({ materials: [], groups: [{ indoor: false, collision: EMPTY_COLLISION }] });
      expect(native.directorySize('/cache')).toBeGreaterThan(0);

      const usage = await service.cacheUsage();
      expect(usage.maps).toEqual([{ directory: 'm', tiles: 1, bytes: expect.any(Number) }]);
      expect(usage.buildingBytes).toBeGreaterThan(0);
      expect(usage.totalBytes).toBe(usage.maps[0].bytes + usage.buildingBytes + usage.modelBytes);

      // after a restart, nothing is parsed again
      await service.close();
      formats.parseAdt.mockClear();
      wmo.parseWmoRoot.mockClear();
      expect((await service.getTilePlacements('M', { tx: 1, ty: 2 }))?.wmos).toHaveLength(1);
      expect(await service.getWmo('World\\wmo\\A.wmo')).toEqual({ materials: [], groups: [{ indoor: false, collision: EMPTY_COLLISION }] });
      expect(formats.parseAdt).not.toHaveBeenCalled();
      expect(wmo.parseWmoRoot).not.toHaveBeenCalled();
    });

    it('preloads tiles, their buildings with what is inside, and the doodad models, reporting progress', async () => {
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: {
              'World\\Maps\\M\\M_1_1.adt': [1],
              'World\\Maps\\M\\M_1_2.adt': [1],
              'World\\Maps\\M\\M_1_3.adt': [1],
              'World\\wmo\\A.wmo': [1],
              'World\\wmo\\B.wmo': [1],
              'World\\Tree.m2': [1],
              'World\\Tree00.skin': [1],
            },
          },
        },
      });
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt
        .mockReturnValueOnce(
          adtOf(
            [],
            [
              { uniqueId: 1, path: 'World\\wmo\\A.wmo', doodadSet: 0 },
              { uniqueId: 2, path: 'World\\wmo\\B.wmo', doodadSet: 0 },
            ],
            [{ uniqueId: 3, path: 'World\\Tree.mdx' }],
          ),
        )
        .mockImplementationOnce(() => {
          throw new Error('bad adt');
        })
        .mockReturnValue(adtOf([], [{ uniqueId: 1, path: 'world\\WMO\\a.wmo', doodadSet: 0 }]));
      wmo.parseWmoRoot.mockImplementationOnce(() => {
        throw new Error('bad wmo');
      });
      wmo.parseWmoRoot.mockReturnValue({ flags: 0, materials: [], groups: [] });
      wmo.parseWmoDoodads.mockImplementationOnce(() => {
        throw new Error('bad doodads');
      });
      wmo.parseWmoDoodads.mockReturnValue({ sets: [], doodads: [{ path: 'World\\Barrel.mdx' }, { path: 'world\\tree.m2' }] });
      m2.parseM2.mockReturnValue({ batches: [] });
      const progress: [number, number][] = [];
      const tiles = [1, 2, 3, 4].map((ty) => ({ tx: 1, ty }));
      expect(await service.preload('M', tiles, (done, total) => progress.push([done, total]))).toBe(true);
      expect(progress).toEqual([
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 6],
        [6, 6],
        [7, 8],
        [8, 8],
      ]);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad adt'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad wmo'));
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad doodads'));
      expect(m2.parseM2).toHaveBeenCalledTimes(1);

      // again: everything is cached, only the cheap steps remain
      progress.length = 0;
      await service.preload('M', tiles.slice(0, 1), (done, total) => progress.push([done, total]));
      expect(progress).toEqual([
        [1, 1],
        [2, 3],
        [3, 3],
        [4, 4],
      ]);
      expect(m2.parseM2).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('stops preloading when cancelled or when the cache is full, at any step', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\M\\M_1_1.adt': [1], 'World\\wmo\\C.wmo': [1] } } },
      });
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(
        adtOf([], [{ uniqueId: 9, path: 'World\\wmo\\C.wmo', doodadSet: 0 }], [{ uniqueId: 3, path: 'Rock.m2' }]),
      );
      wmo.parseWmoRoot.mockReturnValue({ flags: 0, materials: [], groups: [] });
      wmo.parseWmoDoodads.mockReturnValue({ sets: [], doodads: [] });
      const tile = [{ tx: 1, ty: 1 }];
      const after = (steps: number) => {
        let calls = 0;
        return () => calls++ >= steps;
      };
      // cancelled before the first tile, before the buildings, before the models
      for (const steps of [0, 1, 2]) {
        const progress = vi.fn();
        expect(await service.preload('M', tile, progress, after(steps))).toBe(true);
        expect(progress).toHaveBeenCalledTimes(steps);
      }
      await service.preload('M', []);

      // a full cache stops it, before the tiles, the buildings or the models
      const cache = TestBed.inject(WowDataCacheService);
      for (const steps of [0, 1, 2]) {
        const isFull = vi.spyOn(cache, 'isFull').mockImplementation(after(steps));
        expect(await service.preload('M', tile)).toBe(false);
        isFull.mockRestore();
      }
    });

    it('decodes textures', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: { 'Tileset\\Grass.blp': [7] } } } });
      const image = { width: 1, height: 1, data: new Uint8Array(4) };
      formats.decodeBlp.mockReturnValue(image);
      expect(await service.getTexture('tileset\\grass.blp')).toBe(image);
      expect(await service.getTexture('missing.blp')).toBeUndefined();
    });

    it('forgets a WDT that failed to load', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: { 'World\\Maps\\Azeroth\\Azeroth.wdt': [9] } } } });
      formats.parseWdt.mockImplementationOnce(() => {
        throw new Error('bad wdt');
      });
      await expect(service.getMapTiles('Azeroth')).rejects.toThrowError('bad wdt');
      formats.parseWdt.mockReturnValue({ tiles: [{ tx: 3, ty: 3 }], layerSplatDepth: 4 });
      expect(await service.getMapTiles('Azeroth')).toEqual([{ tx: 3, ty: 3 }]);
    });

    it('decodes minimaps through md5translate.trs', async () => {
      const trs = Array.from(new TextEncoder().encode('Azeroth\\map32_48.blp\thash.blp\nAzeroth\\map1_1.blp\tgone.blp\n'));
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'textures\\Minimap\\md5translate.trs': trs, 'textures\\Minimap\\hash.blp': [5] } } },
      });
      const image = { width: 1, height: 1, data: new Uint8Array(4) };
      formats.decodeBlp.mockReturnValue(image);

      expect(await service.getMinimap('Azeroth', { tx: 32, ty: 48 })).toBe(image);
      expect(await service.getMinimap('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();
      expect(await service.getMinimap('Azeroth', { tx: 2, ty: 2 })).toBeUndefined();
      expect(formats.decodeBlp).toHaveBeenCalledTimes(1);
    });

    it('has no minimaps without md5translate.trs', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: {} } } });
      expect(await service.getMinimap('Azeroth', { tx: 32, ty: 48 })).toBeUndefined();
    });
  });
});
