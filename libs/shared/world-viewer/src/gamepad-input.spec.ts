import { TestBed } from '@angular/core/testing';
import { GamepadInputService, PadInput } from './gamepad-input';

describe('GamepadInputService', () => {
  let frames: (() => void)[];
  let pads: (Partial<Gamepad> | null)[];
  const pad = (buttons: number[], axes: number[]): Partial<Gamepad> => ({
    connected: true,
    buttons: buttons.map((value) => ({ pressed: value === 1, touched: false, value })),
    axes,
  });

  beforeEach(() => {
    frames = [];
    pads = [];
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => frames.push(callback));
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => pads });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete (navigator as { getGamepads?: unknown }).getGamepads;
  });
  const frame = () => frames.splice(0).forEach((callback) => callback());

  it('reads buttons and stick directions while a gamepad is connected, as presses and releases', () => {
    const service = TestBed.inject(GamepadInputService);
    const seen: PadInput[] = [];
    service.inputs.subscribe((input) => seen.push(input));
    // none connected: nothing read
    expect(frames).toHaveLength(0);
    pads = [null, pad([1, 0, 0.8], [0, -0.9, 0.7, 0.1, 1])];
    window.dispatchEvent(new Event('gamepadconnected'));
    window.dispatchEvent(new Event('gamepadconnected'));
    expect(frames).toHaveLength(1);
    frame();
    expect(seen).toEqual([
      { input: 'PadA', pressed: true, type: 'paddown' },
      { input: 'PadX', pressed: true, type: 'paddown' },
      { input: 'PadLeftStickUp', pressed: true, type: 'paddown' },
      { input: 'PadRightStickRight', pressed: true, type: 'paddown' },
    ]);
    expect(service.isHeld('PadA')).toBe(true);
    // held: nothing new; let go: released
    frame();
    expect(seen).toHaveLength(4);
    pads = [pad([0, 0, 0], [0, 0, 0, 0])];
    frame();
    expect(seen.slice(4).every((input) => !input.pressed && input.type === 'padup')).toBe(true);
    expect(service.isHeld('PadA')).toBe(false);
    // unplugged: it stops reading
    pads = [];
    frame();
    expect(frames).toHaveLength(0);
  });

  it('copes with a browser without gamepads', () => {
    delete (navigator as { getGamepads?: unknown }).getGamepads;
    TestBed.inject(GamepadInputService);
    expect(frames).toHaveLength(0);
  });
});
