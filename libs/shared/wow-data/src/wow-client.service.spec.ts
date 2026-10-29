import { TestBed } from '@angular/core/testing';
import { buildDbc } from './dbc.mock';
import { EMPTY_COLLISION } from './collision';
import { buildMmtile } from './navmesh.mock';
import { buildServerMap, buildVmapModel, buildVmapTile } from './server-data.mock';
import { WowClientService } from './wow-client.service';
import { WowDataCacheService } from './wow-data-cache.service';
import { WowDataSettingsService } from './wow-data-settings.service';
import { WOW_NATIVE_API } from './wow-native-api';
import { createFakeNative, FakeMpq, FakeNative } from './wow-native-api.mock';

const formats = vi.hoisted(() => ({
  parseAdt: vi.fn(),
  parseWdt: vi.fn(),
  decodeBlp: vi.fn(),
  decodeBlpForGpu: vi.fn(),
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
  parseM2SkeletonFiles: vi.fn(),
  m2Path: (path: string) => path.replace(/\.mdx$/i, '.m2'),
  m2SkinPath: (path: string) => path.replace(/\.(mdx|m2)$/i, '00.skin'),
}));
vi.mock('./m2', () => m2);
const m2Animation = vi.hoisted(() => ({ m2Sequences: vi.fn().mockReturnValue([]) }));
vi.mock('./m2-animation', async (original) => ({ ...(await original<object>()), m2Sequences: m2Animation.m2Sequences }));

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

  describe('boss boundaries', () => {
    const bytes = (text: string) => Array.from(new TextEncoder().encode(text));
    const scripts = '/ac/src/server/scripts/Northrend/Naxx';
    const files = {
      '/ac/src/server/game/Maps/AreaDefines.h': bytes('MAP_NAXXRAMAS = 533,'),
      [`${scripts}/instance_naxxramas.cpp`]: bytes(
        'BossBoundaryData const boundaries = { { BOSS_PATCHWERK, new CircleBoundary(Position(1, 2), 30.0f) }, ' +
          '{ BOSS_PATCHWERK, new ZRangeBoundary(1, 9) }, { BOSS_LONELY, new ZRangeBoundary(1, 2) } }; ' +
          'RegisterInstanceScript(instance_naxxramas, MAP_NAXXRAMAS);',
      ),
      [`${scripts}/boss_patchwerk.cpp`]: bytes('boss_patchwerkAI(Creature* c) : BossAI(c, BOSS_PATCHWERK) { }'),
      [`${scripts}/sub/boss_adds.cpp`]: bytes(
        'npc_addAI(Creature* c) : BossAI(c, BOSS_PATCHWERK) { } boss_patchwerkAI(Creature* c) : BossAI(c, BOSS_PATCHWERK) {}',
      ),
      '/ac/src/server/scripts/Other/instance_plain.cpp': bytes('InstanceMapScript("instance_plain", 1)'),
      '/ac/src/server/scripts/Other/instance_custom.cpp': bytes(
        'InstanceMapScript("instance_custom", MAP_UNKNOWN) BossBoundaryData const b = { { DATA_A, new ZRangeBoundary(1, 2) } };',
      ),
      '/ac/src/server/scripts/Other/instance_numbered.cpp': bytes(
        'InstanceMapScript("instance_numbered", 999) BossBoundaryData const b = { { DATA_B, new ZRangeBoundary(1, 2) } };',
      ),
      '/ac/src/server/scripts/Other/readme.txt': bytes('instance_fake.cpp'),
    };

    it("reads them from the source folder's instance scripts, with the creatures using them, once", async () => {
      const { service, settings, native } = setup({ files });
      expect(await service.getBossBoundaries(533)).toEqual([]);
      settings.save({ ...settings.paths(), sourcePath: '/ac/' });
      expect(await service.getBossBoundaries(533)).toEqual([
        {
          mapId: 533,
          instance: 'instance_naxxramas',
          boss: 'BOSS_PATCHWERK',
          shapes: [
            { type: 'circle', center: { x: 1, y: 2 }, radius: 30, inverted: false },
            { type: 'zrange', minZ: 1, maxZ: 9, inverted: false },
          ],
          scriptNames: ['boss_patchwerk', 'npc_add'],
        },
        { mapId: 533, instance: 'instance_naxxramas', boss: 'BOSS_LONELY', shapes: [expect.any(Object)], scriptNames: [] },
      ]);
      // a map named by a constant that isn't known is skipped; a number is fine
      expect(await service.getBossBoundaries(999)).toHaveLength(1);
      const reads = vi.spyOn(native, 'readFile');
      await service.getBossBoundaries(533);
      expect(reads).not.toHaveBeenCalled();
    });

    it('takes the src folder too, has none without scripts or outside the desktop app', async () => {
      const { service, settings } = setup({ files });
      settings.save({ ...settings.paths(), sourcePath: '/ac/src' });
      expect(await service.getBossBoundaries(533)).toHaveLength(2);
      settings.save({ ...settings.paths(), sourcePath: '/nowhere' });
      expect(await service.getBossBoundaries(533)).toEqual([]);
    });

    it('reads boundaries without the map constants file', async () => {
      const withoutDefines = Object.fromEntries(Object.entries(files).filter(([path]) => !path.endsWith('AreaDefines.h')));
      const { service, settings } = setup({ files: withoutDefines });
      settings.save({ ...settings.paths(), sourcePath: '/ac' });
      expect(await service.getBossBoundaries(533)).toEqual([]);
      expect(await service.getBossBoundaries(999)).toHaveLength(1);
    });

    it('has none outside the desktop app', async () => {
      const { service, settings } = setup({ native: false });
      settings.save({ ...settings.paths(), sourcePath: '/ac' });
      expect(await service.getBossBoundaries(533)).toEqual([]);
    });

    it('reads them again after a failure', async () => {
      const { service, settings, native } = setup({ files });
      settings.save({ ...settings.paths(), sourcePath: '/ac' });
      const readdir = vi.spyOn(native, 'readdir').mockImplementationOnce(() => {
        throw new Error('locked');
      });
      await expect(service.getBossBoundaries(533)).rejects.toThrow('locked');
      readdir.mockRestore();
      expect(await service.getBossBoundaries(533)).toHaveLength(2);
    });
  });

  it('is not supported outside Electron', async () => {
    const { service } = setup({ native: false });
    expect(service.isSupported()).toBe(false);
    await expect(service.readFile('x')).rejects.toThrowError(/only available in the Keira3 desktop app/);
    await expect(service.getMaps()).rejects.toThrowError(/only available in the Keira3 desktop app/);
    expect(service.getServerCoverage(0, [{ tx: 1, ty: 1 }]).size).toBe(0);
    expect(service.memoryUsage()).toBeUndefined();
    expect(await service.graphicsMemory()).toBeUndefined();
  });

  it('requires a client path', async () => {
    const { service } = setup({ clientPath: '' });
    expect(service.isSupported()).toBe(true);
    expect(service.memoryUsage()).toEqual({ used: 500_000_000, total: 8_000_000_000 });
    expect(await service.graphicsMemory()).toBe(6_000_000_000);
    // (read once)
    expect(await service.graphicsMemory()).toBe(6_000_000_000);
    // letting go of what was kept in memory: nothing to lose yet
    expect(() => service.trimMemory()).not.toThrow();
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

    expect(await service.getArchiveNames()).toEqual(['common.MPQ', 'enUS/locale-enUS.MPQ', 'patch.MPQ', 'enUS/patch-enUS-y.mpq']);
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
    expect(await service.getArchiveNames()).toEqual(['common.MPQ', 'deDE/locale-deDE.MPQ', 'patch.MPQ']);
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

    it('dresses player characters from the character DBCs, read once (again after a failure)', async () => {
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\CharSections.dbc': dbc([[1, 3, 0, 0, 'Character\\Dwarf\\Skin.blp', '', '', 0, 0, 0]], 10),
        }),
      });
      expect(await service.getPlayerDisplay(3, 0)).toMatchObject({
        model: 'Character\\Dwarf\\Male\\DwarfMale.m2',
        scale: 1,
        textures: { 1: 'Character\\Dwarf\\Skin.blp' },
        hairGeoset: 1,
      });
      expect((await service.getPlayerDisplay(3, 1))?.model).toBe('Character\\Dwarf\\Female\\DwarfFemale.m2');
    });

    it('has a bare player character when the character DBCs are broken', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\CharSections.dbc': [1, 2, 3, 4] }) });
      expect((await service.getPlayerDisplay(1, 0))?.textures).toEqual({});
      expect((await service.getPlayerDisplay(1, 0))?.textures).toEqual({});
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
          'DBFilesClient\\LightParams.dbc': dbc([[1, 0, 4, 0, 0, 0, 0, 0, 0]]),
          'DBFilesClient\\LightSkybox.dbc': dbc([
            [4, 'Environments\\Stars\\Stars.mdx', 0],
            [5, 'ENVIRONMENTS\\STARS\\stars.mdx', 0],
            [6, 'Environments\\Stars\\Aurora.mdx', 0],
            [7, '', 0],
          ]),
        }),
      });
      const [light] = await service.getZoneLights('azeroth');
      expect(light.id).toBe(1);
      expect(light.skybox).toBe('Environments\\Stars\\Stars.m2');
      expect(await service.getZoneLights('Unknown')).toEqual([]);
      expect(await service.getSkyboxes()).toEqual(['Environments\\Stars\\Aurora.m2', 'ENVIRONMENTS\\STARS\\stars.m2']);
    });

    it('has no zone lights without their DBCs, and retries after a failure', async () => {
      const { service } = setup({
        mpqs: displayMpqs({ 'DBFilesClient\\Map.dbc': mapDbc('Azeroth'), 'DBFilesClient\\LightIntBand.dbc': [1, 2, 3, 4] }),
      });
      await expect(service.getZoneLights('Azeroth')).rejects.toThrowError(/WDBC/);
      await expect(service.getZoneLights('Azeroth')).rejects.toThrowError(/WDBC/);
    });

    it('reads the flight paths and skyboxes again after a failure', async () => {
      const { service } = setup({
        mpqs: displayMpqs({ 'DBFilesClient\\TaxiPath.dbc': [1, 2, 3, 4], 'DBFilesClient\\LightSkybox.dbc': [1, 2, 3, 4] }),
      });
      for (let i = 0; i < 2; i++) {
        await expect(service.getTaxiPaths(0)).rejects.toThrowError(/WDBC/);
        await expect(service.getSkyboxes()).rejects.toThrowError(/WDBC/);
      }
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

    it("reads tiles of the server's navigation mesh for a map", async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { service, native } = setup({
        files: {
          '/srv/dbc/Map.dbc': mapDbc('ServerMap'),
          '/srv/mmaps/0014832.mmtile': Array.from(buildMmtile([{ flags: 1 }])),
          '/srv/mmaps/0014833.mmtile': [1, 2, 3],
        },
        mpqs: standardMpqs(),
        serverDataPath: '/srv',
      });
      expect((await service.getNavMeshTile('servermap', { tx: 32, ty: 48 }))?.positions).toHaveLength(18);
      // no tile there, an unknown map, a broken file
      expect(await service.getNavMeshTile('ServerMap', { tx: 1, ty: 1 })).toBeUndefined();
      expect(await service.getNavMeshTile('Nowhere', { tx: 32, ty: 48 })).toBeUndefined();
      expect(await service.getNavMeshTile('ServerMap', { tx: 33, ty: 48 })).toBeUndefined();
      vi.spyOn(native, 'readFile').mockImplementationOnce(() => {
        throw new Error('locked');
      });
      expect(await service.getNavMeshTile('ServerMap', { tx: 32, ty: 48 })).toBeUndefined();
      expect(warn).toHaveBeenCalledWith('[World Editor] Could not read /srv/mmaps/0014832.mmtile: locked');
      warn.mockRestore();
    });

    it("reads the server's terrain and vmaps, keeping vmap models in memory", async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const { service, native } = setup({
        files: {
          '/srv/maps/0004931.map': Array.from(buildServerMap()),
          '/srv/vmaps/000_31_49.vmtile': Array.from(buildVmapTile([{ name: 'Crate.m2' }])),
          '/srv/vmaps/Crate.m2.vmo': Array.from(buildVmapModel([{ vertices: [0, 0, 0, 1, 0, 0, 0, 1, 0], indices: [0, 1, 2] }])),
          '/srv/vmaps/Broken.wmo.vmo': [1, 2],
        },
        mpqs: standardMpqs(),
        serverDataPath: '/srv',
      });
      expect((await service.getServerMap(0, { tx: 31, ty: 49 }))?.v9).toHaveLength(129 * 129);
      expect(await service.getServerMap(0, { tx: 1, ty: 1 })).toBeUndefined();
      expect((await service.getVmapTile(0, { tx: 31, ty: 49 }))?.[0].name).toBe('Crate.m2');
      const read = vi.spyOn(native, 'readFile');
      expect(await service.getVmapModel('Crate.m2')).toHaveLength(1);
      expect(await service.getVmapModel('Crate.m2')).toHaveLength(1);
      expect(read).toHaveBeenCalledTimes(1);
      expect(await service.getVmapModel('Broken.wmo')).toEqual([]);
      read.mockImplementationOnce(() => {
        throw new Error('locked');
      });
      expect(await service.getVmapTile(0, { tx: 31, ty: 49 })).toBeUndefined();
      expect(warn).toHaveBeenCalledWith('[World Editor] Could not read /srv/vmaps/000_31_49.vmtile: locked');
      await service.close();
      expect(await service.getVmapModel('Crate.m2')).toHaveLength(1);
      expect(read).toHaveBeenCalledTimes(4);
      warn.mockRestore();
    });

    it('names areas, and lists flight masters and flight paths', async () => {
      const float = (value: number) => new Uint32Array(new Float32Array([value]).buffer)[0];
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\AreaTable.dbc': dbc([[87, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 'Goldshire']], 27),
          'DBFilesClient\\TaxiNodes.dbc': dbc([[2, 0, float(1), float(2), float(3), 'Stormwind']], 24),
          'DBFilesClient\\TaxiPath.dbc': dbc([[10, 2, 4, 50]]),
          'DBFilesClient\\TaxiPathNode.dbc': dbc([[100, 10, 0, 0, float(1), float(1), float(1)]]),
        }),
      });
      expect((await service.getAreaNames()).get(87)).toEqual({ name: 'Goldshire', parent: 12 });
      expect(await service.getTaxiNodes(0)).toHaveLength(1);
      expect(await service.getTaxiNodes(1)).toHaveLength(0);
      expect((await service.getTaxiPaths(0))[0].points).toEqual([{ x: 1, y: 1, z: 1 }]);
    });

    it('retries area names and flight masters after a failure', async () => {
      const broken = setup({
        mpqs: displayMpqs({ 'DBFilesClient\\AreaTable.dbc': [1, 2], 'DBFilesClient\\TaxiNodes.dbc': [1, 2] }),
      }).service;
      await expect(broken.getAreaNames()).rejects.toThrowError(/WDBC/);
      await expect(broken.getAreaNames()).rejects.toThrowError(/WDBC/);
      await expect(broken.getTaxiNodes(0)).rejects.toThrowError(/WDBC/);
      await expect(broken.getTaxiNodes(0)).rejects.toThrowError(/WDBC/);
    });

    it('has no area names or flight paths without their DBCs', async () => {
      const missing = setup({ mpqs: displayMpqs({}) }).service;
      expect((await missing.getAreaNames()).size).toBe(0);
      expect(await missing.getTaxiNodes(0)).toEqual([]);
      expect(await missing.getTaxiPaths(0)).toEqual([]);
    });

    it('keeps the few most recent server terrain tiles parsed', async () => {
      const files: Record<string, number[]> = {};
      for (let ty = 40; ty < 50; ty++) {
        files[`/srv/maps/0003${ty}`.replace(/3(\d\d)$/, '$1') + '31.map'] = Array.from(buildServerMap());
      }
      const { service, native } = setup({ files, mpqs: standardMpqs(), serverDataPath: '/srv' });
      const read = vi.spyOn(native, 'readFile');
      await service.getServerMap(0, { tx: 31, ty: 40 });
      await service.getServerMap(0, { tx: 31, ty: 40 });
      expect(read).toHaveBeenCalledTimes(1);
      for (let ty = 41; ty < 50; ty++) {
        await service.getServerMap(0, { tx: 31, ty });
      }
      // the first one was dropped to keep 9
      await service.getServerMap(0, { tx: 31, ty: 40 });
      expect(read).toHaveBeenCalledTimes(11);
    });

    it('tells which server files each tile has', () => {
      const { service } = setup({
        files: { '/srv/maps/0004931.map': [1], '/srv/mmaps/0004931.mmtile': [1], '/srv/vmaps/000_32_49.vmtile': [1] },
        mpqs: standardMpqs(),
        serverDataPath: '/srv',
      });
      const coverage = service.getServerCoverage(0, [
        { tx: 31, ty: 49 },
        { tx: 32, ty: 49 },
      ]);
      expect(coverage.get('31_49')).toEqual({ map: true, vmap: false, mmap: true });
      expect(coverage.get('32_49')).toEqual({ map: false, vmap: true, mmap: false });
    });

    it('knows no server files without a server data folder', () => {
      const { service } = setup({ mpqs: standardMpqs() });
      expect(service.getServerCoverage(0, [{ tx: 31, ty: 49 }]).size).toBe(0);
    });

    it('has no server terrain or vmaps without a server data folder', async () => {
      const { service } = setup({ mpqs: standardMpqs() });
      expect(await service.getServerMap(0, { tx: 31, ty: 49 })).toBeUndefined();
      expect(await service.getVmapModel('Crate.m2')).toBeUndefined();
    });

    it('has no navigation mesh without a server data folder', async () => {
      const { service } = setup({ mpqs: standardMpqs() });
      expect(await service.getNavMeshTile('ClientMap', { tx: 32, ty: 48 })).toBeUndefined();
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
      expect(await service.getSkyboxes()).toEqual([]);
    });

    it('reads the faction templates and factions', async () => {
      const faction = [72, 19, 1100, 690, 1, 0, 0, 0, 0, 0, 3100, -42000, 4000, 0, ...Array(9).fill(0), 'Stormwind'];
      const { service } = setup({
        mpqs: displayMpqs({
          'DBFilesClient\\FactionTemplate.dbc': dbc([[11, 72, 0, 3, 2, 12, 0, 0, 0, 0, 0, 0, 0, 0]], 14),
          'DBFilesClient\\Faction.dbc': dbc([faction], 57),
        }),
      });
      const data = await service.getFactions();
      expect(data.templates.get(11)?.faction).toBe(72);
      expect(data.factions.get(72)?.name).toBe('Stormwind');
      expect(await service.getFactions()).toBe(data);
    });

    it('has no factions without their DBCs', async () => {
      const { service } = setup({ mpqs: displayMpqs({}) });
      expect((await service.getFactions()).templates.size).toBe(0);
    });

    it('retries the factions after a failure', async () => {
      const { service } = setup({ mpqs: displayMpqs({ 'DBFilesClient\\Faction.dbc': [1, 2, 3, 4] }) });
      await expect(service.getFactions()).rejects.toThrowError(/WDBC/);
      await expect(service.getFactions()).rejects.toThrowError(/WDBC/);
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
      // a map with terrain has no one building
      expect(await service.getMapBuilding('Azeroth')).toBeUndefined();
      expect(formats.parseWdt).toHaveBeenCalledTimes(1);
      expect(Array.from(formats.parseWdt.mock.calls[0][0])).toEqual([9]);
      expect(await service.getMapTiles('Nowhere')).toEqual([]);
    });

    it("gives a map made of one building (a dungeon) the tile under it, holding the building and what's inside", async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\Dungeon\\Dungeon.wdt': [9], 'World\\wmo\\Dungeon.wmo': [1] } } },
      });
      const building = {
        uniqueId: 7,
        path: 'World\\wmo\\Dungeon.wmo',
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: 1,
        doodadSet: 0,
      };
      // where it stands: around the middle of tile 30_33
      const bounds = { minX: -300, maxX: -200, minY: 900, maxY: 1100, minZ: 0, maxZ: 40 };
      formats.parseWdt.mockReturnValue({ tiles: [], layerSplatDepth: 4, wmo: building, wmoBounds: bounds });
      wmo.parseWmoDoodads.mockReturnValue({ sets: [], doodads: [] });
      expect(await service.getMapTiles('Dungeon')).toEqual([{ tx: 30, ty: 32 }]);
      expect(await service.getMapBuilding('Dungeon')).toEqual({ placement: building, bounds });
      expect((await service.getTilePlacements('Dungeon', { tx: 30, ty: 32 }))?.wmos).toEqual([building]);
      expect(await service.getTilePlacements('Dungeon', { tx: 31, ty: 32 })).toBeUndefined();
      // preloading it caches the building
      const getWmo = vi.spyOn(service, 'getWmo');
      expect(await service.preload('Dungeon', [{ tx: 30, ty: 32 }])).toBe(true);
      expect(getWmo).toHaveBeenCalledWith('world\\wmo\\dungeon.wmo');
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
      for (let i = 0; i < 66; i++) {
        files[`World\\Maps\\M\\M_${i}_0.adt`] = [0, 0, 0, 0, 0, 0, 0, 0];
      }
      const { service } = setup({ mpqs: { 'common.MPQ': { files } } });
      // (without the disk cache, which would serve evicted tiles)
      TestBed.inject(WowDataCacheService).setEnabled(false);
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(adtOf());
      for (let i = 0; i < 66; i++) {
        await service.getTilePlacements('M', { tx: i, ty: 0 });
      }
      await service.getTilePlacements('M', { tx: 65, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(66);
      await service.getTilePlacements('M', { tx: 0, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(67);

      formats.parseAdt.mockImplementationOnce(() => {
        throw new Error('bad adt');
      });
      await expect(service.getTilePlacements('M', { tx: 1, ty: 0 })).rejects.toThrowError('bad adt');
      await service.getTilePlacements('M', { tx: 1, ty: 0 });
      expect(formats.parseAdt).toHaveBeenCalledTimes(69);
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

    it('reads the skeleton and animations of a model, with the .anim files they need, once', async () => {
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: { 'World\\Wolf.m2': [1], 'World\\Wolf00.skin': [2], 'World\\Wolf0004-00.anim': [3], 'World\\NoSkin.m2': [4] },
          },
        },
      });
      const walk = { index: 1, id: 4, fileId: 4, variation: 0, external: true };
      const run = { index: 2, id: 5, fileId: 5, variation: 0, external: true };
      m2Animation.m2Sequences.mockReturnValue([{ index: 0, id: 0, fileId: 0, variation: 0, external: false }, walk, run]);
      m2.parseM2SkeletonFiles.mockReturnValue({ parents: [], animations: [] });
      expect(await service.getM2Skeleton('World\\Wolf.mdx')).toEqual({ parents: [], animations: [] });
      const [model, skin, refs, anims] = m2.parseM2SkeletonFiles.mock.calls[0];
      expect([model[0], skin[0], refs.length]).toEqual([1, 2, 3]);
      // (the run's .anim is missing: left out)
      expect([...(anims as Map<number, Uint8Array>).keys()]).toEqual([1]);
      // cached
      await service.getM2Skeleton('World\\Wolf.mdx');
      expect(m2.parseM2SkeletonFiles).toHaveBeenCalledTimes(1);
      expect(await service.getM2Skeleton('World\\NoSkin.m2')).toBeUndefined();
      expect(await service.getM2Skeleton('World\\Missing.m2')).toBeUndefined();
    });

    it('tells how an item looks when held, and whether it is a shield; again after a failure', async () => {
      const dbc = (rows: (number | string)[][], fieldCount?: number) => Array.from(buildDbc(rows, fieldCount));
      const displays = new Array(25).fill(0);
      displays[0] = 500;
      displays[1] = 'Sword.mdx';
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: {
              'DBFilesClient\\Item.dbc': dbc(
                [
                  [25, 2, 7, 0, 0, 500, 13, 3],
                  [26, 4, 6, 0, 0, 500, 14, 4],
                  [27, 2, 7, 0, 0, 999, 13, 3],
                ],
                8,
              ),
              'DBFilesClient\\ItemDisplayInfo.dbc': dbc([displays], 25),
            },
          },
        },
      });
      expect(await service.getItemDisplay(25)).toEqual({ display: expect.objectContaining({ models: ['Sword.mdx', ''] }), shield: false });
      expect((await service.getItemDisplay(26))?.shield).toBe(true);
      expect(await service.getItemDisplay(27)).toBeUndefined();
      expect(await service.getItemDisplay(28)).toBeUndefined();

      TestBed.resetTestingModule();
      const broken = setup({ mpqs: { 'common.MPQ': { files: { 'DBFilesClient\\Item.dbc': [1, 2, 3, 4] } } } }).service;
      await expect(broken.getItemDisplay(25)).rejects.toThrowError(/WDBC/);
      await expect(broken.getItemDisplay(25)).rejects.toThrowError(/WDBC/);
      // without the DBCs: nothing
      TestBed.resetTestingModule();
      expect(await setup({ mpqs: { 'common.MPQ': { files: {} } } }).service.getItemDisplay(25)).toBeUndefined();
    });

    it("hides the mesh of particle emitters, which the game doesn't draw", async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Fx\\LavaSmokeEmitter.m2': [1], 'World\\Fx\\LavaSmokeEmitter00.skin': [2] } } },
      });
      m2.parseM2.mockReturnValue({ batches: [{ alpha: 1 }], collision: EMPTY_COLLISION });
      expect((await service.getM2('World\\Fx\\LavaSmokeEmitter.mdx'))?.batches).toEqual([{ alpha: 0 }]);
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
      m2.parseM2.mockReturnValue({ batches: [], collision: { positions: [], indices: [] } });
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
      // (the models are read from the cache, to list their textures)
      expect(progress).toEqual([
        [1, 1],
        [2, 3],
        [3, 3],
        [4, 5],
        [5, 5],
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

    it('preloads the textures of the tiles, buildings and models, as the graphics card takes them, once', async () => {
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: {
              'World\\Maps\\M\\M_1_1.adt': [1],
              'World\\wmo\\A.wmo': [1],
              'World\\Tree.m2': [1],
              'World\\Tree00.skin': [1],
              'Tileset\\Grass.blp': [1],
              'Wall.blp': [1],
              'Bark.blp': [1],
            },
          },
        },
      });
      formats.parseWdt.mockReturnValue(undefined);
      formats.parseAdt.mockReturnValue(
        adtOf(
          [{ position: [0, 0, 0], layers: [{ texture: 'Tileset\\Grass.blp' }] }, { position: [0, 0, 0] }],
          [{ uniqueId: 1, path: 'World\\wmo\\A.wmo', doodadSet: 0 }],
          [{ uniqueId: 2, path: 'World\\Tree.mdx' }],
        ),
      );
      wmo.parseWmoRoot.mockReturnValue({ flags: 0, materials: [{ texture: 'Wall.blp' }, {}], groups: [] });
      wmo.parseWmoDoodads.mockReturnValue({ sets: [], doodads: [] });
      m2.parseM2.mockReturnValue({ batches: [{ texture: 'Bark.blp' }, {}] });
      formats.decodeBlpForGpu.mockReturnValue({
        format: 'dxt1',
        width: 4,
        height: 4,
        mips: [{ width: 4, height: 4, data: new Uint8Array(8) }],
      });
      expect(await service.preload('M', [{ tx: 1, ty: 1 }])).toBe(true);
      expect(formats.decodeBlpForGpu).toHaveBeenCalledTimes(3);
      // cached: not decoded again
      expect(await service.getGpuTexture('wall.blp')).toEqual(expect.objectContaining({ format: 'dxt1' }));
      expect(formats.decodeBlpForGpu).toHaveBeenCalledTimes(3);
      expect(await service.preload('M', [{ tx: 1, ty: 1 }])).toBe(true);
      expect(formats.decodeBlpForGpu).toHaveBeenCalledTimes(3);
      expect(await service.getGpuTexture('missing.blp')).toBeUndefined();
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
      // the index unreadable once: read again next time
      const read = vi.spyOn(service, 'readFile').mockRejectedValueOnce(new Error('busy'));
      await expect(service.getMinimap('Azeroth', { tx: 32, ty: 48 })).rejects.toThrow('busy');
      read.mockRestore();

      expect(await service.getMinimap('Azeroth', { tx: 32, ty: 48 })).toBe(image);
      expect(await service.getMinimap('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();
      expect(await service.getMinimap('Azeroth', { tx: 2, ty: 2 })).toBeUndefined();
      expect(formats.decodeBlp).toHaveBeenCalledTimes(1);
    });

    it('pictures whole maps from their minimaps, kept in the cache', async () => {
      const trs = Array.from(
        new TextEncoder().encode('Azeroth\\map32_48.blp\thash.blp\nAzeroth\\map33_49.blp\thash.blp\nBlind\\map01_01.blp\thash.blp\n'),
      );
      const { service } = setup({
        mpqs: {
          'common.MPQ': {
            files: {
              'textures\\Minimap\\md5translate.trs': trs,
              'textures\\Minimap\\hash.blp': [5],
              'World\\Maps\\Azeroth\\Azeroth.wdt': [9],
              'World\\Maps\\Empty\\Empty.wdt': [9],
              'World\\Maps\\Blind\\Blind.wdt': [9],
            },
          },
        },
      });
      // a 2 × 2 red minimap
      formats.decodeBlp.mockReturnValue({ width: 2, height: 2, data: new Uint8Array(16).fill(255) });
      formats.parseWdt.mockImplementation((bytes: Uint8Array) => ({ tiles: [], layerSplatDepth: 4, bytes }));
      formats.parseWdt.mockReturnValueOnce({
        tiles: [
          { tx: 32, ty: 48 },
          { tx: 33, ty: 49 },
          { tx: 32, ty: 49 },
        ],
        layerSplatDepth: 4,
      });
      const picture = await service.getMapThumbnail('Azeroth');
      // 2 × 2 tiles of 128 pixels: the top-left and bottom-right drawn, the bottom-left (no minimap) left clear
      expect([picture?.width, picture?.height]).toEqual([256, 256]);
      expect(picture?.data[0]).toBe(255);
      expect(picture?.data[(255 * 256 + 255) * 4]).toBe(255);
      expect(picture?.data[(255 * 256 + 0) * 4 + 3]).toBe(0);
      formats.decodeBlp.mockClear();
      expect((await service.getMapThumbnail('Azeroth'))?.width).toBe(256);
      expect(formats.decodeBlp).not.toHaveBeenCalled();
      // no tiles; tiles without minimaps
      expect(await service.getMapThumbnail('Empty')).toBeUndefined();
      // its one minimap can't be decoded
      formats.parseWdt.mockReturnValueOnce({ tiles: [{ tx: 1, ty: 1 }], layerSplatDepth: 4 });
      formats.decodeBlp.mockImplementationOnce(() => {
        throw new Error('bad blp');
      });
      expect(await service.getMapThumbnail('Blind')).toBeUndefined();
    });

    it('has no minimaps without md5translate.trs', async () => {
      const { service } = setup({ mpqs: { 'common.MPQ': { files: {} } } });
      expect(await service.getMinimap('Azeroth', { tx: 32, ty: 48 })).toBeUndefined();
    });
  });
});
