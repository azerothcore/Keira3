import { TestBed } from '@angular/core/testing';
import { STARTUP_LOAD_DELAY, STARTUP_LOAD_KEY, StartupLoadService } from './startup-load.service';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

describe('StartupLoadService', () => {
  const setup = (supported = true) => {
    const client = {
      isSupported: () => supported,
      getArchiveNames: vi.fn().mockResolvedValue([]),
      getFactions: vi.fn().mockResolvedValue({}),
      getAreaNames: vi.fn().mockResolvedValue(new Map()),
      getGameMap: vi.fn().mockResolvedValue({}),
      getMaps: vi.fn().mockRejectedValue(new Error('no Map.dbc')),
      getScriptNames: vi.fn().mockResolvedValue([]),
      getAllBossBoundaries: vi.fn().mockResolvedValue([]),
      getAllScriptSpawns: vi.fn().mockResolvedValue([]),
    };
    TestBed.configureTestingModule({ providers: [{ provide: WowClientService, useValue: client }] });
    TestBed.inject(WowDataSettingsService).save({ clientPath: '/wow', serverDataPath: '/data', sourcePath: '' });
    return { service: TestBed.inject(StartupLoadService), client };
  };

  beforeEach(() => localStorage.clear());

  it('reads nothing unless asked, then the folders asked for and set, saying how each went', async () => {
    const { service, client } = setup();
    expect(service.chosen()).toEqual({ client: false, server: false, source: false });
    await service.run();
    expect(client.getArchiveNames).not.toHaveBeenCalled();
    service.choose('client', true);
    service.choose('server', true);
    // (no source folder: not read)
    service.choose('source', true);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    await service.run();
    expect(client.getArchiveNames).toHaveBeenCalled();
    expect(client.getScriptNames).not.toHaveBeenCalled();
    expect(service.states()).toEqual({ client: 'done', server: 'failed' });
    // kept for next time
    TestBed.resetTestingModule();
    expect(setup().service.chosen()).toEqual({ client: true, server: true, source: true });
  });

  it('reads the source scripts, after a moment once Keira has started', async () => {
    vi.useFakeTimers();
    try {
      const { service, client } = setup();
      TestBed.inject(WowDataSettingsService).save({ clientPath: '', serverDataPath: '', sourcePath: '/ac' });
      service.choose('source', true);
      service.startup();
      expect(client.getScriptNames).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(STARTUP_LOAD_DELAY);
      expect(client.getScriptNames).toHaveBeenCalled();
      expect(client.getAllBossBoundaries).toHaveBeenCalled();
      expect(service.states()).toEqual({ source: 'done' });
    } finally {
      vi.useRealTimers();
    }
  });

  it('does nothing outside the desktop app, and survives broken or blocked storage', async () => {
    localStorage.setItem(STARTUP_LOAD_KEY, '{broken');
    const { service, client } = setup(false);
    expect(service.chosen().client).toBe(false);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    service.choose('client', true);
    expect(service.chosen().client).toBe(true);
    await service.run();
    expect(client.getArchiveNames).not.toHaveBeenCalled();
  });
});
