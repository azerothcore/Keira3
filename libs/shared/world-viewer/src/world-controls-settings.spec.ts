import { TestBed } from '@angular/core/testing';
import {
  controlFor,
  controlMatches,
  DEFAULT_WORLD_CONTROLS_SETTINGS,
  inputLabel,
  inputOf,
  WORLD_CONTROLS_SETTINGS_KEY,
  WorldControlsSettingsService,
} from './world-controls-settings';

const key = (code: string, mods: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean } = {}) =>
  new KeyboardEvent('keydown', { code, ...mods });

describe('world controls', () => {
  beforeEach(() => localStorage.removeItem(WORLD_CONTROLS_SETTINGS_KEY));

  it('starts with the default bindings', () => {
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('adds, removes and resets bindings, and remembers them', () => {
    const service = TestBed.inject(WorldControlsSettingsService);
    service.addBinding('forward', 'KeyI');
    service.addBinding('forward', 'KeyI');
    service.removeBinding('forward', 'ArrowUp');
    service.addBinding('undo', 'Ctrl+Alt+KeyU');
    service.setKeyboardNavigation(false);
    expect(service.settings().bindings.forward).toEqual(['KeyW', 'KeyI']);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(WorldControlsSettingsService);
    expect(restored.settings().bindings.forward).toEqual(['KeyW', 'KeyI']);
    expect(restored.settings().bindings.undo).toEqual(['Ctrl+KeyZ', 'Ctrl+Alt+KeyU']);
    expect(restored.settings().keyboardNavigation).toBe(false);

    restored.resetAction('forward');
    expect(restored.settings().bindings.forward).toEqual(['KeyW', 'ArrowUp']);
    restored.reset();
    expect(restored.settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('keeps the camera speed within its limits, and remembers it', () => {
    const service = TestBed.inject(WorldControlsSettingsService);
    service.setSpeed(2.345);
    expect(service.settings().speed).toBe(2.35);
    service.setSpeed(50);
    expect(service.settings().speed).toBe(10);
    service.setSpeed(0);
    expect(service.settings().speed).toBe(0.1);
    TestBed.resetTestingModule();
    expect(TestBed.inject(WorldControlsSettingsService).settings().speed).toBe(0.1);
    TestBed.resetTestingModule();
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, JSON.stringify({ speed: 99 }));
    expect(TestBed.inject(WorldControlsSettingsService).settings().speed).toBe(1);
  });

  it('tells which other actions an input clashes with', () => {
    const service = TestBed.inject(WorldControlsSettingsService);
    expect(service.clashes('forward', 'KeyW')).toEqual([]);
    service.addBinding('toggleGizmo', 'KeyW');
    expect(service.clashes('forward', 'KeyW')).toEqual(['toggleGizmo']);
  });

  it('reads the older two-key format and ignores damaged settings', () => {
    localStorage.setItem(
      WORLD_CONTROLS_SETTINGS_KEY,
      JSON.stringify({ keyboardNavigation: 'yes', keys: { forward: ['KeyI', ''], back: [1, 2] } }),
    );
    const settings = TestBed.inject(WorldControlsSettingsService).settings();
    expect(settings.bindings.forward).toEqual(['KeyI']);
    expect(settings.bindings.back).toEqual(['KeyS', 'ArrowDown']);
    expect(settings.keyboardNavigation).toBe(true);

    TestBed.resetTestingModule();
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, '{');
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('writes key presses as bindings, and bindings as labels', () => {
    expect(inputOf(key('KeyZ', { ctrlKey: true, shiftKey: true }))).toBe('Ctrl+Shift+KeyZ');
    expect(inputOf(key('KeyZ', { metaKey: true, altKey: true }))).toBe('Ctrl+Alt+KeyZ');
    expect(inputOf(key('ShiftLeft', { shiftKey: true }))).toBeUndefined();
    expect(inputOf(key(''))).toBeUndefined();
    expect(inputLabel('Ctrl+Shift+KeyZ')).toBe('Ctrl+Shift+Z');
    expect(inputLabel('ArrowUp')).toBe('↑');
    expect(inputLabel('Digit1')).toBe('1');
    expect(inputLabel('PageUp')).toBe('PageUp');
  });

  it('matches key presses: camera moves ignore Shift, other actions need their exact modifiers', () => {
    const settings = DEFAULT_WORLD_CONTROLS_SETTINGS;
    expect(controlMatches(settings, 'forward', key('KeyW', { shiftKey: true }))).toBe(true);
    expect(controlMatches(settings, 'undo', key('KeyZ', { ctrlKey: true }))).toBe(true);
    expect(controlMatches(settings, 'undo', key('KeyZ', { ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(controlMatches(settings, 'redo', key('KeyZ', { ctrlKey: true, shiftKey: true }))).toBe(true);
    expect(controlMatches(settings, 'undo', key('ControlLeft', { ctrlKey: true }))).toBe(false);
    expect(controlFor(settings, ['undo', 'redo', 'delete'], key('Delete'))).toBe('delete');
    expect(controlFor(settings, ['undo', 'redo'], key('KeyP'))).toBeUndefined();
  });
});
