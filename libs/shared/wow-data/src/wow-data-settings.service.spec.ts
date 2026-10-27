import { TestBed } from '@angular/core/testing';
import { trimPath, WOW_DATA_SETTINGS_KEY, WowDataSettingsService } from './wow-data-settings.service';

describe('WowDataSettingsService', () => {
  beforeEach(() => localStorage.clear());

  const create = (): WowDataSettingsService => TestBed.inject(WowDataSettingsService);

  it('starts empty when nothing is stored', () => {
    const service = create();
    expect(service.paths()).toEqual({ clientPath: '', serverDataPath: '', sourcePath: '' });
    expect(service.isConfigured()).toBe(false);
  });

  it('saves cleaned paths and restores them', () => {
    create().save({ clientPath: ' "C:\\Games\\WoW\\" ', serverDataPath: 'C:/Server/Data/' });
    expect(JSON.parse(localStorage.getItem(WOW_DATA_SETTINGS_KEY) as string)).toEqual({
      clientPath: 'C:\\Games\\WoW',
      serverDataPath: 'C:/Server/Data',
      sourcePath: '',
    });

    TestBed.resetTestingModule();
    const restored = create();
    expect(restored.paths().clientPath).toBe('C:\\Games\\WoW');
    expect(restored.isConfigured()).toBe(true);
  });

  it('keeps the AzerothCore source folder', () => {
    create().save({ clientPath: 'C:\\WoW', serverDataPath: '', sourcePath: 'C:\\Source\\azerothcore-wotlk\\' });
    TestBed.resetTestingModule();
    expect(create().paths().sourcePath).toBe('C:\\Source\\azerothcore-wotlk');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem(WOW_DATA_SETTINGS_KEY, JSON.stringify({ clientPath: 3 }));
    expect(create().paths()).toEqual({ clientPath: '', serverDataPath: '', sourcePath: '' });
  });

  it('ignores corrupted storage', () => {
    localStorage.setItem(WOW_DATA_SETTINGS_KEY, '{oops');
    expect(create().paths()).toEqual({ clientPath: '', serverDataPath: '', sourcePath: '' });
  });

  it('trims paths', () => {
    expect(trimPath('  /a/b//  ')).toBe('/a/b');
    expect(trimPath('"x"')).toBe('x');
  });
});
