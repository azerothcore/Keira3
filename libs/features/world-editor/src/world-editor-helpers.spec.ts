import { contextPlacement, travelTime } from './world-editor.component';

describe('world editor helpers', () => {
  it('writes travel times as minutes and seconds', () => {
    expect(travelTime(0)).toBe('0m 00s');
    expect(travelTime(65.4)).toBe('1m 05s');
    expect(travelTime(20)).toBe('0m 20s');
  });

  it('opens the context menu away from the window edges', () => {
    vi.stubGlobal('innerWidth', 1000);
    vi.stubGlobal('innerHeight', 800);
    // top left: to the right and down
    expect(contextPlacement({ left: 10, top: 20 }, { x: 100, y: 100 })).toEqual({ left: 110, top: 120, maxHeight: 672 });
    // bottom right: to the left and up
    expect(contextPlacement({ left: 10, top: 20 }, { x: 800, y: 700 })).toEqual({ right: 190, bottom: 80, maxHeight: 712 });
    vi.unstubAllGlobals();
  });
});
