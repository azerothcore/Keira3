import { TestBed } from '@angular/core/testing';
import {
  CONTROL_CONTEXTS,
  controlFor,
  controlMatches,
  inputConflict,
  isModifierCode,
  MOUSE_INPUTS,
  mouseInputOf,
  pressedInputs,
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
    service.removeBinding('forward', 'PadLeftStickUp');
    service.addBinding('undo', 'Ctrl+Alt+KeyU');
    service.setKeyboardNavigation(false);
    expect(service.settings().bindings.forward).toEqual(['KeyW', 'KeyI']);

    TestBed.resetTestingModule();
    const restored = TestBed.inject(WorldControlsSettingsService);
    expect(restored.settings().bindings.forward).toEqual(['KeyW', 'KeyI']);
    expect(restored.settings().bindings.undo).toEqual(['Ctrl+KeyZ', 'Ctrl+Alt+KeyU']);
    expect(restored.settings().keyboardNavigation).toBe(false);

    restored.setActionBindings('undo', ['2x KeyU']);
    expect(restored.settings().bindings.undo).toEqual(['2x KeyU']);
    restored.resetAction('forward');
    expect(restored.settings().bindings.forward).toEqual(['KeyW', 'ArrowUp', 'PadLeftStickUp']);
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
    expect(settings.bindings.back).toEqual(['KeyS', 'ArrowDown', 'PadLeftStickDown']);
    expect(settings.keyboardNavigation).toBe(true);

    TestBed.resetTestingModule();
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, '{');
    expect(TestBed.inject(WorldControlsSettingsService).settings()).toEqual(DEFAULT_WORLD_CONTROLS_SETTINGS);
  });

  it('moves settings saved with the old up / down keys to the new ones (Q up, E down), keeping changed ones', () => {
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, JSON.stringify({ bindings: { up: ['KeyE', 'PageUp'], down: ['KeyQ', 'PageDown'] } }));
    const settings = TestBed.inject(WorldControlsSettingsService).settings();
    expect(settings.bindings.up).toEqual(['KeyQ', 'PageUp', 'PadRB']);
    expect(settings.bindings.down).toEqual(['KeyE', 'PageDown', 'PadLB']);

    TestBed.resetTestingModule();
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, JSON.stringify({ bindings: { up: ['KeyE'], down: ['KeyQ', 'PageDown'] } }));
    expect(TestBed.inject(WorldControlsSettingsService).settings().bindings.up).toEqual(['KeyE']);
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

  it('writes mouse buttons, wheel steps and gamepad inputs as bindings, and labels them', () => {
    expect(mouseInputOf(new MouseEvent('pointerdown', { button: 3 }))).toBe('Mouse4');
    expect(mouseInputOf(new MouseEvent('pointerdown', { button: 2, shiftKey: true }))).toBe('Shift+MouseRight');
    expect(mouseInputOf(new MouseEvent('pointerdown', { button: 9 }))).toBeUndefined();
    expect(mouseInputOf(new WheelEvent('wheel', { deltaY: -1, ctrlKey: true }))).toBe('Ctrl+WheelUp');
    expect(mouseInputOf(new WheelEvent('wheel', { deltaY: 1 }))).toBe('WheelDown');
    expect(mouseInputOf(new WheelEvent('wheel', { deltaY: 0 }))).toBeUndefined();
    expect(MOUSE_INPUTS).toContain('Alt+WheelDown');
    expect(isModifierCode('AltRight')).toBe(true);
    expect(inputLabel('Mouse4')).toBe('Mouse 4');
    expect(inputLabel('Shift+MouseRight')).toBe('Shift+Mouse Right');
    expect(inputLabel('WheelUp')).toBe('Wheel Up');
    expect(inputLabel('PadA')).toBe('Pad A (Down)');
    expect(inputLabel('PadLeftStickUp')).toBe('Pad Left Stick Up');
    expect(inputLabel('PadStart')).toBe('Pad Start');
    expect(inputLabel('2x KeyK')).toBe('2x K');
  });

  it('tells a double tap: the same input again quickly, not after letting go, and not a third time', () => {
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000);
    const settings = {
      ...DEFAULT_WORLD_CONTROLS_SETTINGS,
      bindings: { ...DEFAULT_WORLD_CONTROLS_SETTINGS.bindings, worldMap: ['2x KeyK'] },
    };
    const press = key('KeyK');
    expect(pressedInputs(press)).toEqual(['KeyK']);
    // the same event read again (by another listener): the same answer
    expect(pressedInputs(press)).toEqual(['KeyK']);
    expect(pressedInputs(new KeyboardEvent('keyup', { code: 'KeyK' }))).toEqual(['KeyK']);
    now.mockReturnValue(1200);
    expect(controlMatches(settings, 'worldMap', key('KeyK'))).toBe(true);
    now.mockReturnValue(1300);
    expect(pressedInputs(key('KeyK'))).toEqual(['KeyK']);
    now.mockReturnValue(2000);
    expect(pressedInputs(key('KeyK'))).toEqual(['KeyK']);
    // gamepad inputs and mouse buttons too
    expect(controlFor(settings, ['markerToCursor'], { input: 'PadA', type: 'paddown' })).toBe('markerToCursor');
    expect(pressedInputs(new MouseEvent('pointerdown', { button: 1 }))).toEqual(['MouseMiddle']);
    expect(pressedInputs(key('ShiftLeft'))).toEqual([]);
    now.mockRestore();
  });

  it('tells inputs on other actions: clashing when they work at the same time, shared when never', () => {
    const service = TestBed.inject(WorldControlsSettingsService);
    service.addBinding('toggleGizmo', 'KeyW');
    expect(service.conflict('forward', 'KeyW')).toBe('clash');
    expect(service.conflict('forward', 'ArrowUp')).toBe('none');
    const apart = { ...CONTROL_CONTEXTS, toggleGizmo: 2 };
    expect(inputConflict(service.settings(), 'forward', 'KeyW', apart)).toBe('shared');
  });
});
