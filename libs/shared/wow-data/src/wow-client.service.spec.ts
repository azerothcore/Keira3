import { TestBed } from '@angular/core/testing';
import { buildDbc } from './dbc.mock';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';
import { WOW_NATIVE_API } from './wow-native-api';
import { createFakeNative, FakeMpq, FakeNative } from './wow-native-api.mock';

const formats = vi.hoisted(() => ({
  parseAdtChunks: vi.fn(),
  parseWdt: vi.fn(),
  decodeBlp: vi.fn(),
}));
vi.mock('./formats', () => formats);

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
      formats.parseAdtChunks.mockReturnValue([]);
      const mesh = await service.getTerrain('Azeroth', { tx: 32, ty: 48 });
      expect(mesh?.tile).toEqual({ tx: 32, ty: 48 });
      expect(formats.parseAdtChunks.mock.calls[0][1]).toBe(8);
      expect(await service.getTerrain('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();

      await service.getTerrain('NoWdt', { tx: 1, ty: 1 });
      expect(formats.parseAdtChunks.mock.calls[1][1]).toBe(4);
    });

    it('builds textured terrain and liquids from ADTs', async () => {
      const { service } = setup({
        mpqs: { 'common.MPQ': { files: { 'World\\Maps\\Azeroth\\Azeroth_32_48.adt': [1, 2, 3, 4, 0, 0, 0, 0] } } },
      });
      formats.parseWdt.mockReturnValue({ tiles: [], layerSplatDepth: 4 });
      formats.parseAdtChunks.mockReturnValue([{ position: [0, 0, 0], vertexHeights: [], holes: 0, layers: [{ texture: 'a.blp' }] }]);
      const detail = await service.getTerrainDetail('Azeroth', { tx: 32, ty: 48 });
      expect(detail?.chunks[0].textures).toEqual(['a.blp']);
      expect(detail?.liquids).toEqual([]);
      expect(await service.getTerrainDetail('Azeroth', { tx: 1, ty: 1 })).toBeUndefined();
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
