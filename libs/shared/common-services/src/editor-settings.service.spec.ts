import { TestBed } from '@angular/core/testing';
import { DEFAULT_EDITOR_SETTINGS, EDITOR_SETTINGS_KEY, EditorSettingsService } from './editor-settings.service';

describe('EditorSettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('starts copying only queries that ran, updating flags by bits, and searching parts, 50 rows', () => {
    const service = TestBed.inject(EditorSettingsService);
    expect(service.settings()).toEqual(DEFAULT_EDITOR_SETTINGS);
    expect(service.search('creature_template')).toEqual({ exactNumbers: false, exactNames: false, limit: 50 });
  });

  it("keeps each table's search over the default, and an empty value follows the default again", () => {
    const service = TestBed.inject(EditorSettingsService);
    service.saveSearch('default', { exactNumbers: true, limit: 100 });
    service.saveSearch('creature_template', { exactNames: true, limit: 20 });
    expect(service.search('creature_template')).toEqual({ exactNumbers: true, exactNames: true, limit: 20 });
    expect(service.search('item_template')).toEqual({ exactNumbers: true, exactNames: false, limit: 100 });
    service.saveSearch('creature_template', { limit: undefined });
    expect(service.search('creature_template').limit).toBe(100);
    service.save({ copyOnlyOnSuccess: false });
    TestBed.resetTestingModule();
    const again = TestBed.inject(EditorSettingsService);
    expect(again.settings().copyOnlyOnSuccess).toBe(false);
    expect(again.search('creature_template')).toEqual({ exactNumbers: true, exactNames: true, limit: 100 });
  });

  it('survives broken, odd or blocked storage', () => {
    localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify({ copyOnlyOnSuccess: 'x', bitwiseFlags: false, search: [] }));
    expect(TestBed.inject(EditorSettingsService).settings()).toEqual({ ...DEFAULT_EDITOR_SETTINGS, bitwiseFlags: false });
    TestBed.resetTestingModule();
    localStorage.setItem(EDITOR_SETTINGS_KEY, '{broken');
    const service = TestBed.inject(EditorSettingsService);
    expect(service.settings()).toEqual(DEFAULT_EDITOR_SETTINGS);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    service.save({ bitwiseFlags: false });
    expect(service.settings().bitwiseFlags).toBe(false);
    // (nothing for "default" at all: 50)
    service.save({ search: {} });
    expect(service.search('x')).toEqual({ exactNumbers: false, exactNames: false, limit: 50 });
  });
});
