import { TestBed } from '@angular/core/testing';
import {
  DEFAULT_WORLD_CONTROLS_SETTINGS,
  keyLabel,
  WORLD_CONTROLS_SETTINGS_KEY,
  WorldControlsSettingsService,
} from './world-controls-settings';

describe('WorldControlsSettingsService', () => {
  beforeEach(() => localStorage.clear());

  it('starts with W A S D and the arrow keys', () => {
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
    expect(DEFAULT_WORLD_CONTROLS_SETTINGS.keys.forward).toEqual(['KeyW', 'ArrowUp']);
  });

  it('rebinds keys, moving a key away from the action it had, and remembers them', () => {
    const service = TestBed.inject(WorldControlsSettingsService);
    service.bind('forward', 1, 'KeyI');
    service.bind('up', 0, 'KeyW');
    expect(service.settings().keys.forward).toEqual(['', 'KeyI']);
    expect(service.settings().keys.up).toEqual(['KeyW', 'PageUp']);
    service.setKeyboardNavigation(false);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(WorldControlsSettingsService).settings();
    expect(restored.keyboardNavigation).toBe(false);
    expect(restored.keys.up).toEqual(['KeyW', 'PageUp']);

    TestBed.inject(WorldControlsSettingsService).reset();
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('ignores invalid or damaged storage', () => {
    localStorage.setItem(
      WORLD_CONTROLS_SETTINGS_KEY,
      JSON.stringify({ keyboardNavigation: 'yes', keys: { forward: ['KeyW'], back: [1, 2] } }),
    );
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
    TestBed.resetTestingModule();
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, '{nope');
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('names keys for display', () => {
    expect(keyLabel('KeyW')).toBe('W');
    expect(keyLabel('ArrowUp')).toBe('↑');
    expect(keyLabel('Digit1')).toBe('1');
    expect(keyLabel('PageUp')).toBe('PageUp');
  });
});
