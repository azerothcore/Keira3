import { TestBed } from '@angular/core/testing';
import { DEFAULT_SERVER_SETTINGS, isDatabaseName, SERVER_SETTINGS_KEY, ServerSettingsService } from './server-settings.service';

describe('ServerSettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the settings, with defaults for what is missing or of the wrong kind', () => {
    localStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify({ charactersDatabase: 'chars', soapPort: 'x', other: 1 }));
    const service = TestBed.inject(ServerSettingsService);
    expect(service.settings()).toEqual({ ...DEFAULT_SERVER_SETTINGS, charactersDatabase: 'chars' });
    service.save({ soapEnabled: true });
    expect(JSON.parse(localStorage.getItem(SERVER_SETTINGS_KEY) as string).soapEnabled).toBe(true);
  });

  it('survives broken or blocked storage', () => {
    localStorage.setItem(SERVER_SETTINGS_KEY, '{broken');
    const service = TestBed.inject(ServerSettingsService);
    expect(service.settings()).toEqual(DEFAULT_SERVER_SETTINGS);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    service.save({ charactersDatabase: 'x' });
    expect(service.settings().charactersDatabase).toBe('x');
  });

  it('tells database names safe to query', () => {
    expect(isDatabaseName('acore_characters')).toBe(true);
    expect(isDatabaseName('chars`; DROP')).toBe(false);
    expect(isDatabaseName('')).toBe(false);
    // nothing kept yet: the defaults
    expect(TestBed.inject(ServerSettingsService).settings()).toEqual(DEFAULT_SERVER_SETTINGS);
  });
});
