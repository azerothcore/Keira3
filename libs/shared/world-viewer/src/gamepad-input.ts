import { Service } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { PAD_AXES, PAD_BUTTONS } from './world-controls-settings';

/** A button counts as pressed, and a stick as pushed one way, past this far (0..1). */
export const PAD_THRESHOLD = 0.5;

/** A gamepad input pressed or let go, as a binding (`PadA`, `PadLeftStickUp`). */
export interface PadInput {
  input: string;
  pressed: boolean;
  /** `paddown` or `padup`: the same object goes to every listener, so they agree on double taps. */
  type: 'paddown' | 'padup';
}

/**
 * Gamepads (and other controllers the browser maps to the standard layout): their buttons and stick directions as
 * inputs, pressed and let go, read every frame while one is connected and something listens (the world editor's view:
 * nowhere else in Keira).
 */
@Service()
export class GamepadInputService {
  private readonly changes = new Subject<PadInput>();
  private listeners = 0;
  private readonly onConnected = () => this.start();
  /** Every press and release, from any connected gamepad, while subscribed. */
  readonly inputs: Observable<PadInput> = new Observable<PadInput>((subscriber) => {
    const subscription = this.changes.subscribe(subscriber);
    if (++this.listeners === 1) {
      window.addEventListener('gamepadconnected', this.onConnected);
      this.start();
    }
    return () => {
      subscription.unsubscribe();
      if (--this.listeners === 0) {
        // nobody listening any more (the world editor was left): no more reading
        window.removeEventListener('gamepadconnected', this.onConnected);
        cancelAnimationFrame(this.frame as number);
        this.frame = undefined;
        this.held.clear();
      }
    };
  });
  private readonly held = new Set<string>();
  private frame?: number;

  /** The inputs held down now. */
  isHeld(input: string): boolean {
    return this.held.has(input);
  }

  private start(): void {
    if (this.frame === undefined && this.pads().length) {
      this.frame = requestAnimationFrame(() => this.poll());
    }
  }

  private pads(): Gamepad[] {
    return [...(navigator.getGamepads?.() ?? [])].filter((pad): pad is Gamepad => !!pad?.connected);
  }

  private poll(): void {
    this.frame = undefined;
    const pads = this.pads();
    const now = new Set<string>();
    for (const pad of pads) {
      pad.buttons.forEach((button, index) => {
        if (PAD_BUTTONS[index] && (button.pressed || button.value > PAD_THRESHOLD)) {
          now.add(PAD_BUTTONS[index]);
        }
      });
      pad.axes.forEach((value, index) => {
        if (PAD_AXES[index] && Math.abs(value) > PAD_THRESHOLD) {
          now.add(PAD_AXES[index][value < 0 ? 0 : 1]);
        }
      });
    }
    for (const input of now) {
      if (!this.held.has(input)) {
        this.held.add(input);
        this.changes.next({ input, pressed: true, type: 'paddown' });
      }
    }
    for (const input of [...this.held]) {
      if (!now.has(input)) {
        this.held.delete(input);
        this.changes.next({ input, pressed: false, type: 'padup' });
      }
    }
    // (until the last one is gone, and everything was let go)
    if (pads.length) {
      this.frame = requestAnimationFrame(() => this.poll());
    }
  }
}
