import { TestBed } from '@angular/core/testing';
import { MODEL_VIEWER_KEY, ModelViewerSettingService } from './model-viewer-setting.service';
import { WowClientService } from './wow-client.service';
import { WowDataSettingsService } from './wow-data-settings.service';

describe('ModelViewerSettingService', () => {
  const setup = (supported = true, clientPath = '/wow') => {
    TestBed.configureTestingModule({ providers: [{ provide: WowClientService, useValue: { isSupported: () => supported } }] });
    TestBed.inject(WowDataSettingsService).save({ clientPath, serverDataPath: '' });
    return TestBed.inject(ModelViewerSettingService);
  };

  beforeEach(() => localStorage.clear());

  it('shows Wowhead by default, the game data when chosen, and remembers it', () => {
    const service = setup();
    expect(service.source()).toBe('wowhead');
    expect(service.useGameData()).toBe(false);

    service.choose('game-data');

    expect(service.useGameData()).toBe(true);
    expect(localStorage.getItem(MODEL_VIEWER_KEY)).toBe('game-data');
    TestBed.resetTestingModule();
    expect(setup().source()).toBe('game-data');
  });

  it('uses the game data only in the desktop app, with a client folder set', () => {
    localStorage.setItem(MODEL_VIEWER_KEY, 'game-data');
    expect(setup(false).useGameData()).toBe(false);
    TestBed.resetTestingModule();
    expect(setup(true, '').useGameData()).toBe(false);
  });

  it('keeps going when the storage is blocked', () => {
    const service = setup();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    service.choose('game-data');
    expect(service.source()).toBe('game-data');
    vi.mocked(Storage.prototype.setItem).mockRestore();
    TestBed.resetTestingModule();
    expect(setup().source()).toBe('wowhead');
    vi.restoreAllMocks();
  });
});
