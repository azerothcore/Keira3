import { Service, signal } from '@angular/core';

/**
 * Keyboard controls of the 3D world editor, the ArmA way: every action can have any number of bindings, and a binding
 * is a key (`KeyboardEvent.code`) with the modifiers that must be held, written like `Ctrl+KeyZ`.
 */
export type ControlAction =
  // camera
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  // marker
  | 'markerToCursor'
  | 'cameraToMarker'
  // editing
  | 'undo'
  | 'redo'
  | 'delete'
  | 'toggleGizmo'
  | 'cancel'
  | 'copy'
  | 'paste'
  // panels
  | 'worldMap'
  | 'compass';

/** The camera moves held down: along the ground relative to the view, and up/down. Shift makes them faster. */
export type NavigationAction = Extract<ControlAction, 'forward' | 'back' | 'left' | 'right' | 'up' | 'down'>;
export const NAVIGATION_ACTIONS: NavigationAction[] = ['forward', 'back', 'left', 'right', 'up', 'down'];

export type ControlGroup = 'camera' | 'marker' | 'editing' | 'panels';

/** Every action, in the order of the settings panel, with its group. */
export const CONTROL_ACTIONS: { action: ControlAction; group: ControlGroup }[] = [
  ...NAVIGATION_ACTIONS.map((action) => ({ action, group: 'camera' as const })),
  { action: 'markerToCursor', group: 'marker' },
  { action: 'cameraToMarker', group: 'marker' },
  { action: 'undo', group: 'editing' },
  { action: 'redo', group: 'editing' },
  { action: 'delete', group: 'editing' },
  { action: 'toggleGizmo', group: 'editing' },
  { action: 'cancel', group: 'editing' },
  { action: 'copy', group: 'editing' },
  { action: 'paste', group: 'editing' },
  { action: 'worldMap', group: 'panels' },
  { action: 'compass', group: 'panels' },
];

export const CONTROL_GROUPS: ControlGroup[] = ['camera', 'marker', 'editing', 'panels'];

export const DEFAULT_CONTROL_BINDINGS: Record<ControlAction, string[]> = {
  forward: ['KeyW', 'ArrowUp'],
  back: ['KeyS', 'ArrowDown'],
  left: ['KeyA', 'ArrowLeft'],
  right: ['KeyD', 'ArrowRight'],
  up: ['KeyQ', 'PageUp'],
  down: ['KeyE', 'PageDown'],
  markerToCursor: ['Space'],
  cameraToMarker: ['Home'],
  undo: ['Ctrl+KeyZ'],
  redo: ['Ctrl+KeyY', 'Ctrl+Shift+KeyZ'],
  delete: ['Delete'],
  toggleGizmo: ['KeyR'],
  cancel: ['Escape'],
  copy: ['Ctrl+KeyC'],
  paste: ['Ctrl+KeyV'],
  worldMap: ['KeyM'],
  compass: ['KeyK'],
};

/** The defaults before Q and E were swapped (Q now goes up): saved settings still on them get the new ones. */
const OLD_UP = ['KeyE', 'PageUp'];
const OLD_DOWN = ['KeyQ', 'PageDown'];
const same = (a: unknown, b: string[]): boolean => Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);

export interface WorldControlsSettings {
  keyboardNavigation: boolean;
  bindings: Record<ControlAction, string[]>;
  /** Camera speed of the movement keys (×1 = normal); Shift + mouse wheel changes it. */
  speed: number;
}

/** Slowest and fastest camera speed. */
export const MIN_CAMERA_SPEED = 0.1;
export const MAX_CAMERA_SPEED = 10;
/** Holding Shift moves the camera this many times faster. */
export const SHIFT_SPEED = 3;

export const DEFAULT_WORLD_CONTROLS_SETTINGS: WorldControlsSettings = {
  keyboardNavigation: true,
  bindings: DEFAULT_CONTROL_BINDINGS,
  speed: 1,
};

export const WORLD_CONTROLS_SETTINGS_KEY = 'keira3.worldEditor.controls';

const MODIFIER_CODES = ['ControlLeft', 'ControlRight', 'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'];

/** A key press as a binding: `Ctrl+Shift+KeyZ` (⌘ counts as Ctrl); undefined for a modifier pressed on its own. */
export function inputOf(event: KeyboardEvent): string | undefined {
  if (!event.code || MODIFIER_CODES.includes(event.code)) {
    return undefined;
  }
  const mods = [event.ctrlKey || event.metaKey ? 'Ctrl' : '', event.shiftKey ? 'Shift' : '', event.altKey ? 'Alt' : ''];
  return [...mods.filter(Boolean), event.code].join('+');
}

/** `Ctrl+KeyZ` → "Ctrl+Z", `ArrowUp` → "↑", `Digit1` → "1"; anything else as is. */
export function inputLabel(input: string): string {
  const arrows: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  return input
    .split('+')
    .map((part) => arrows[part] ?? part.replace(/^Key|^Digit/, ''))
    .join('+');
}

/**
 * Whether a key press fires an action. Camera moves ignore Shift (held to go faster); everything else needs exactly the
 * modifiers of one of its bindings.
 */
export function controlMatches(settings: WorldControlsSettings, action: ControlAction, event: KeyboardEvent): boolean {
  const input = inputOf(event);
  if (!input) {
    return false;
  }
  const navigation = (NAVIGATION_ACTIONS as ControlAction[]).includes(action);
  const normalise = (value: string): string => (navigation ? value.replace('Shift+', '') : value);
  return settings.bindings[action].some((binding) => normalise(binding) === normalise(input));
}

/** The first action a key press fires, among the given ones. */
export function controlFor<T extends ControlAction>(settings: WorldControlsSettings, actions: T[], event: KeyboardEvent): T | undefined {
  return actions.find((action) => controlMatches(settings, action, event));
}

/** Keyboard settings of the 3D world editor, saved on this computer. */
@Service()
export class WorldControlsSettingsService {
  private readonly _settings = signal<WorldControlsSettings>(this.load());
  readonly settings = this._settings.asReadonly();

  setKeyboardNavigation(enabled: boolean): void {
    this.save({ ...this._settings(), keyboardNavigation: enabled });
  }

  setSpeed(speed: number): void {
    const clamped = Math.min(MAX_CAMERA_SPEED, Math.max(MIN_CAMERA_SPEED, Math.round(speed * 100) / 100));
    this.save({ ...this._settings(), speed: clamped });
  }

  addBinding(action: ControlAction, input: string): void {
    const current = this._settings().bindings[action];
    if (!current.includes(input)) {
      this.setBindings(action, [...current, input]);
    }
  }

  removeBinding(action: ControlAction, input: string): void {
    this.setBindings(
      action,
      this._settings().bindings[action].filter((binding) => binding !== input),
    );
  }

  resetAction(action: ControlAction): void {
    this.setBindings(action, DEFAULT_CONTROL_BINDINGS[action]);
  }

  reset(): void {
    this.save(DEFAULT_WORLD_CONTROLS_SETTINGS);
  }

  /** Other actions the same input is bound to: they clash (only the first one in the list fires). */
  clashes(action: ControlAction, input: string): ControlAction[] {
    const bindings = this._settings().bindings;
    return CONTROL_ACTIONS.map((a) => a.action).filter((other) => other !== action && bindings[other].includes(input));
  }

  private setBindings(action: ControlAction, inputs: string[]): void {
    const settings = this._settings();
    this.save({ ...settings, bindings: { ...settings.bindings, [action]: [...inputs] } });
  }

  private save(settings: WorldControlsSettings): void {
    this._settings.set(settings);
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, JSON.stringify(settings));
  }

  private load(): WorldControlsSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(WORLD_CONTROLS_SETTINGS_KEY) ?? '{}') as {
        keyboardNavigation?: unknown;
        speed?: unknown;
        bindings?: Record<string, unknown>;
        /** the older format: two keys (primary, alternate) per camera move */
        keys?: Record<string, unknown>;
      };
      const bindings = { ...DEFAULT_CONTROL_BINDINGS };
      const saved: Record<string, unknown> = { ...stored.keys, ...stored.bindings };
      if (same(saved['up'], OLD_UP) && same(saved['down'], OLD_DOWN)) {
        [saved['up'], saved['down']] = [DEFAULT_CONTROL_BINDINGS.up, DEFAULT_CONTROL_BINDINGS.down];
      }
      for (const { action } of CONTROL_ACTIONS) {
        const inputs = saved[action];
        if (Array.isArray(inputs) && inputs.every((input) => typeof input === 'string')) {
          bindings[action] = inputs.filter(Boolean);
        }
      }
      const enabled = typeof stored.keyboardNavigation === 'boolean' ? stored.keyboardNavigation : true;
      const speed =
        typeof stored.speed === 'number' && stored.speed >= MIN_CAMERA_SPEED && stored.speed <= MAX_CAMERA_SPEED ? stored.speed : 1;
      return { keyboardNavigation: enabled, bindings, speed };
    } catch {
      return DEFAULT_WORLD_CONTROLS_SETTINGS;
    }
  }
}
