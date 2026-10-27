import { Service, signal } from '@angular/core';

/** Camera moves bound to keys: along the ground relative to the view, and up/down. */
export type NavigationAction = 'forward' | 'back' | 'left' | 'right' | 'up' | 'down';

export const NAVIGATION_ACTIONS: NavigationAction[] = ['forward', 'back', 'left', 'right', 'up', 'down'];

/** Keyboard navigation of the 3D view: two keys per action (primary, alternate), as `KeyboardEvent.code`s. */
export interface WorldControlsSettings {
  keyboardNavigation: boolean;
  keys: Record<NavigationAction, [string, string]>;
}

export const DEFAULT_WORLD_CONTROLS_SETTINGS: WorldControlsSettings = {
  keyboardNavigation: true,
  keys: {
    forward: ['KeyW', 'ArrowUp'],
    back: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],
    up: ['KeyE', 'PageUp'],
    down: ['KeyQ', 'PageDown'],
  },
};

export const WORLD_CONTROLS_SETTINGS_KEY = 'keira3.worldEditor.controls';

/** "KeyW" → "W", "ArrowUp" → "↑", "Digit1" → "1"; anything else as is. */
export function keyLabel(code: string): string {
  const arrows: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
  return arrows[code] ?? code.replace(/^Key|^Digit/, '');
}

/** Keyboard settings of the 3D world editor, saved on this computer. */
@Service()
export class WorldControlsSettingsService {
  private readonly _settings = signal<WorldControlsSettings>(this.load());
  readonly settings = this._settings.asReadonly();

  setKeyboardNavigation(enabled: boolean): void {
    this.save({ ...this._settings(), keyboardNavigation: enabled });
  }

  /** Binds a key to an action's primary (0) or alternate (1) slot; the key is taken from any action it was bound to. */
  bind(action: NavigationAction, slot: 0 | 1, code: string): void {
    const keys = { ...this._settings().keys };
    for (const other of NAVIGATION_ACTIONS) {
      keys[other] = keys[other].map((bound) => (bound === code ? '' : bound)) as [string, string];
    }
    const pair = [...keys[action]] as [string, string];
    pair[slot] = code;
    keys[action] = pair;
    this.save({ ...this._settings(), keys });
  }

  reset(): void {
    this.save(DEFAULT_WORLD_CONTROLS_SETTINGS);
  }

  private save(settings: WorldControlsSettings): void {
    this._settings.set(settings);
    localStorage.setItem(WORLD_CONTROLS_SETTINGS_KEY, JSON.stringify(settings));
  }

  private load(): WorldControlsSettings {
    try {
      const stored = JSON.parse(localStorage.getItem(WORLD_CONTROLS_SETTINGS_KEY) ?? '{}') as Partial<WorldControlsSettings>;
      const keys = { ...DEFAULT_WORLD_CONTROLS_SETTINGS.keys };
      for (const action of NAVIGATION_ACTIONS) {
        const pair = stored.keys?.[action];
        if (Array.isArray(pair) && pair.length === 2 && pair.every((code) => typeof code === 'string')) {
          keys[action] = pair;
        }
      }
      const enabled = typeof stored.keyboardNavigation === 'boolean' ? stored.keyboardNavigation : true;
      return { keyboardNavigation: enabled, keys };
    } catch {
      return DEFAULT_WORLD_CONTROLS_SETTINGS;
    }
  }
}
