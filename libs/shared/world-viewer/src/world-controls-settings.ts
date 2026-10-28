import { Service, signal } from '@angular/core';

/**
 * Controls of the 3D world editor, the ArmA way: every action can have any number of bindings, and the same input can
 * be on several actions. A binding is a key (`KeyboardEvent.code`), a mouse button or wheel step (`MouseLeft`,
 * `Mouse4`, `WheelUp`…) or a gamepad button or stick direction (`PadA`, `PadLeftStickUp`…), with the modifiers that
 * must be held (`Ctrl+KeyZ`), or tapped twice quickly (`2x KeyK`).
 */
export type ControlAction =
  // camera
  | 'forward'
  | 'back'
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'turnLeft'
  | 'turnRight'
  | 'lookUp'
  | 'lookDown'
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

/** The camera moves held down: along the ground relative to the view, up/down, and turning around what it looks at. Shift makes them faster. */
export type NavigationAction = Extract<
  ControlAction,
  'forward' | 'back' | 'left' | 'right' | 'up' | 'down' | 'turnLeft' | 'turnRight' | 'lookUp' | 'lookDown'
>;
export const NAVIGATION_ACTIONS: NavigationAction[] = [
  'forward',
  'back',
  'left',
  'right',
  'up',
  'down',
  'turnLeft',
  'turnRight',
  'lookUp',
  'lookDown',
];

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
  forward: ['KeyW', 'ArrowUp', 'PadLeftStickUp'],
  back: ['KeyS', 'ArrowDown', 'PadLeftStickDown'],
  left: ['KeyA', 'ArrowLeft', 'PadLeftStickLeft'],
  right: ['KeyD', 'ArrowRight', 'PadLeftStickRight'],
  up: ['KeyQ', 'PageUp', 'PadRB'],
  down: ['KeyE', 'PageDown', 'PadLB'],
  // (the right stick turns the camera around what it looks at)
  turnLeft: ['PadRightStickLeft'],
  turnRight: ['PadRightStickRight'],
  lookUp: ['PadRightStickUp'],
  lookDown: ['PadRightStickDown'],
  markerToCursor: ['Space', 'PadA'],
  cameraToMarker: ['Home', 'PadY'],
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

/** A second press of the same input this soon (ms) after the first is a double tap. */
export const DOUBLE_TAP_MS = 300;
/** The double tap of an input: `2x KeyK`. */
export const DOUBLE_TAP = '2x ';
/** Mouse buttons by `MouseEvent.button`. */
const MOUSE_BUTTONS = ['MouseLeft', 'MouseMiddle', 'MouseRight', 'Mouse4', 'Mouse5'];
/** What the mouse can be bound to, offered in a list while binding (the mouse is busy with the page then). */
export const MOUSE_INPUTS = [
  'MouseLeft',
  'MouseRight',
  'MouseMiddle',
  'Mouse4',
  'Mouse5',
  'WheelUp',
  'WheelDown',
  '2x MouseLeft',
  '2x MouseRight',
  ...['Shift', 'Ctrl', 'Alt'].flatMap((mod) => ['MouseLeft', 'MouseRight', 'MouseMiddle'].map((input) => `${mod}+${input}`)),
  // (Shift + wheel changes the camera speed)
  ...['Ctrl', 'Alt'].flatMap((mod) => ['WheelUp', 'WheelDown'].map((input) => `${mod}+${input}`)),
];
/** Gamepad buttons by their index in the standard mapping. */
export const PAD_BUTTONS = [
  'PadA',
  'PadB',
  'PadX',
  'PadY',
  'PadLB',
  'PadRB',
  'PadLT',
  'PadRT',
  'PadSelect',
  'PadStart',
  'PadLeftStickPress',
  'PadRightStickPress',
  'PadDpadUp',
  'PadDpadDown',
  'PadDpadLeft',
  'PadDpadRight',
  'PadHome',
];
/** Gamepad stick directions by axis (standard mapping): the negative way, then the positive one. */
export const PAD_AXES: [string, string][] = [
  ['PadLeftStickLeft', 'PadLeftStickRight'],
  ['PadLeftStickUp', 'PadLeftStickDown'],
  ['PadRightStickLeft', 'PadRightStickRight'],
  ['PadRightStickUp', 'PadRightStickDown'],
];
const PAD_LABELS: Record<string, string> = {
  PadA: 'Pad A (Down)',
  PadB: 'Pad B (Right)',
  PadX: 'Pad X (Left)',
  PadY: 'Pad Y (Up)',
  PadLB: 'Pad Left Bumper',
  PadRB: 'Pad Right Bumper',
  PadLT: 'Pad Left Trigger',
  PadRT: 'Pad Right Trigger',
  PadDpadUp: 'Pad D-pad Up',
  PadDpadDown: 'Pad D-pad Down',
  PadDpadLeft: 'Pad D-pad Left',
  PadDpadRight: 'Pad D-pad Right',
};

const modifiersOf = (event: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }): string[] =>
  [event.ctrlKey || event.metaKey ? 'Ctrl' : '', event.shiftKey ? 'Shift' : '', event.altKey ? 'Alt' : ''].filter(Boolean);

/** Whether a key is a modifier (Ctrl, Shift, Alt, ⌘), which waits for the key it goes with when binding. */
export function isModifierCode(code: string): boolean {
  return MODIFIER_CODES.includes(code);
}

/** A key press as a binding: `Ctrl+Shift+KeyZ` (⌘ counts as Ctrl); undefined for a modifier pressed on its own. */
export function inputOf(event: KeyboardEvent): string | undefined {
  if (!event.code || isModifierCode(event.code)) {
    return undefined;
  }
  return [...modifiersOf(event), event.code].join('+');
}

/** A mouse button or wheel step as a binding (`Shift+MouseRight`, `WheelUp`); undefined for anything else. */
export function mouseInputOf(event: MouseEvent): string | undefined {
  const input =
    event.type === 'wheel'
      ? (event as WheelEvent).deltaY < 0
        ? 'WheelUp'
        : (event as WheelEvent).deltaY > 0
          ? 'WheelDown'
          : undefined
      : MOUSE_BUTTONS[event.button];
  return input && [...modifiersOf(event), input].join('+');
}

/** `Ctrl+KeyZ` → "Ctrl+Z", `ArrowUp` → "↑", `Digit1` → "1", `Mouse4` → "Mouse 4", `PadA` → "Pad A (Down)", `2x KeyK` → "2x K". */
export function inputLabel(input: string): string {
  const twice = input.startsWith(DOUBLE_TAP);
  const arrows: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  const label = (twice ? input.slice(DOUBLE_TAP.length) : input)
    .split('+')
    .map(
      (part) =>
        arrows[part] ??
        PAD_LABELS[part] ??
        part
          .replace(/^Key|^Digit/, '')
          .replace(/^(Mouse|Wheel|Pad)(?=[A-Z0-9])/, '$1 ')
          .replace(/(Stick|Dpad)(?=[A-Z])/, '$1 ')
          .replace(/^Pad (Left|Right)Stick/, 'Pad $1 Stick'),
    )
    .join('+');
  return twice ? `2x ${label}` : label;
}

/** Inputs already read for an event (so every caller agrees on whether it was a double tap), and the last press. */
const readInputs = new WeakMap<object, string[]>();
let lastPress: { input: string; time: number } | undefined;

/**
 * What a press (a key, a mouse button or wheel step, or a gamepad input given as a binding) can fire: the input, and
 * its double tap (`2x …`) when it's the same as the press just before.
 */
export function pressedInputs(event: KeyboardEvent | MouseEvent | { input: string }): string[] {
  const known = readInputs.get(event);
  if (known) {
    return known;
  }
  // (a modifier pressed on its own is its own input: `ShiftLeft`)
  const keyInput = (key: KeyboardEvent) => (isModifierCode(key.code) ? key.code : inputOf(key));
  const input = 'input' in event ? event.input : event instanceof KeyboardEvent ? keyInput(event) : mouseInputOf(event);
  // (letting go is no press, nor a key repeating while held: they're matched as they are)
  const release = ('type' in event && /up$/.test(event.type)) || (event instanceof KeyboardEvent && event.repeat);
  const now = performance.now();
  const twice = !release && !!input && lastPress?.input === input && now - lastPress.time <= DOUBLE_TAP_MS;
  const inputs = !input ? [] : twice ? [input, DOUBLE_TAP + input] : [input];
  if (input && !release) {
    // (a double tap starts over: a third press is a first one again)
    lastPress = inputs.length > 1 ? undefined : { input, time: now };
  }
  readInputs.set(event, inputs);
  return inputs;
}

/** Where each action works (bits; actions sharing a context and an input clash): the whole editor, for all of them. */
const EDITOR_CONTEXT = 1;
export const CONTROL_CONTEXTS = Object.fromEntries(
  Object.keys(DEFAULT_CONTROL_BINDINGS).map((action) => [action, EDITOR_CONTEXT]),
) as Record<ControlAction, number>;

/** Actions Shift doesn't change the binding of: camera moves (faster), and the marker (on the ground or a liquid). */
const SHIFT_FREE_ACTIONS: ControlAction[] = [...NAVIGATION_ACTIONS, 'markerToCursor'];

/**
 * Whether a key press fires an action. Camera moves and the marker ignore Shift; everything else needs exactly the
 * modifiers of one of its bindings.
 */
export function controlMatches(
  settings: WorldControlsSettings,
  action: ControlAction,
  event: KeyboardEvent | MouseEvent | { input: string },
): boolean {
  const shiftFree = SHIFT_FREE_ACTIONS.includes(action);
  const normalise = (value: string): string => (shiftFree ? value.replace('Shift+', '') : value);
  const inputs = pressedInputs(event).map(normalise);
  return settings.bindings[action].some((binding) => inputs.includes(normalise(binding)));
}

/** The first action a press fires, among the given ones. */
export function controlFor<T extends ControlAction>(
  settings: WorldControlsSettings,
  actions: readonly T[],
  event: KeyboardEvent | MouseEvent | { input: string },
): T | undefined {
  return actions.find((action) => controlMatches(settings, action, event));
}

/**
 * What else an input of an action is on: `clash` when another action has it too (both work at the same time, so only
 * the first in the list fires: one should change), `shared` when the other is never active at the same time (fine),
 * `none` otherwise. Every action of the editor works at the same time, so sharing an input is always a clash here.
 */
export function inputConflict(
  settings: WorldControlsSettings,
  action: ControlAction,
  input: string,
  contexts: Record<ControlAction, number> = CONTROL_CONTEXTS,
): 'none' | 'shared' | 'clash' {
  const others = CONTROL_ACTIONS.filter((other) => other.action !== action && settings.bindings[other.action].includes(input));
  if (others.length === 0) {
    return 'none';
  }
  return others.some((other) => (contexts[other.action] & contexts[action]) !== 0) ? 'clash' : 'shared';
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

  /** An action's bindings, all at once. */
  setActionBindings(action: ControlAction, inputs: string[]): void {
    this.setBindings(action, inputs);
  }

  resetAction(action: ControlAction): void {
    this.setBindings(action, DEFAULT_CONTROL_BINDINGS[action]);
  }

  reset(): void {
    this.save(DEFAULT_WORLD_CONTROLS_SETTINGS);
  }

  /** What else an input of an action is on (see `inputConflict`): red for a clash, orange when shared. */
  conflict(action: ControlAction, input: string): 'none' | 'shared' | 'clash' {
    return inputConflict(this._settings(), action, input);
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
