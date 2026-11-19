import { TestBed } from '@angular/core/testing';
import { colorNumber, cssColor, DEFAULT_WORLD_STYLE, WORLD_STYLE_KEY, WorldStyleService } from './world-style';

describe('WorldStyleService', () => {
  beforeEach(() => localStorage.clear());
  const service = () => {
    TestBed.resetTestingModule();
    return TestBed.inject(WorldStyleService);
  };

  it('starts with the defaults, keeps changes between sessions, and resets one or all', () => {
    const styles = service();
    expect(styles.style()).toEqual(DEFAULT_WORLD_STYLE);
    styles.update({ creature: { color: '#123456', opacity: 0.5 }, creatureShape: 'diamond', waypointSize: 2 });
    expect(service().style().creature).toEqual({ color: '#123456', opacity: 0.5 });
    const again = service();
    expect(again.style().creatureShape).toBe('diamond');
    again.reset('creature');
    expect(again.style().creature).toEqual(DEFAULT_WORLD_STYLE.creature);
    expect(again.style().creatureShape).toBe('diamond');
    again.reset();
    expect(again.style()).toEqual(DEFAULT_WORLD_STYLE);
  });

  it('ignores stored values that do not fit, and damaged settings', () => {
    localStorage.setItem(
      WORLD_STYLE_KEY,
      JSON.stringify({
        creature: { color: 'red', opacity: 1 },
        gameobject: { color: '#000000', opacity: 2 },
        selected: { color: '#000000' },
        aggro: null,
        assist: { color: '#00ff00', opacity: 0.5 },
        creatureShape: 'star',
        gameobjectShape: 'sphere',
        waypointSize: -1,
        pathOpacity: 0.4,
        pathColors: ['#ffffff'],
        tag: 'purple',
      }),
    );
    const style = service().style();
    expect(style.creature).toEqual(DEFAULT_WORLD_STYLE.creature);
    expect(style.gameobject).toEqual(DEFAULT_WORLD_STYLE.gameobject);
    expect(style.selected).toEqual(DEFAULT_WORLD_STYLE.selected);
    expect(style.aggro).toEqual(DEFAULT_WORLD_STYLE.aggro);
    expect(style.assist).toEqual({ color: '#00ff00', opacity: 0.5 });
    expect(style.creatureShape).toBe('cylinder');
    expect(style.gameobjectShape).toBe('sphere');
    expect(style.waypointSize).toBe(1);
    expect(style.pathOpacity).toBe(0.4);
    expect(style.pathColors).toEqual(DEFAULT_WORLD_STYLE.pathColors);
    expect(style.tag).toEqual(DEFAULT_WORLD_STYLE.tag);
    localStorage.setItem(WORLD_STYLE_KEY, '{nope');
    expect(service().style()).toEqual(DEFAULT_WORLD_STYLE);
    // (nowhere to keep it: still used)
    const styles = service();
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    styles.update({ pathOpacity: 0.3 });
    expect(styles.style().pathOpacity).toBe(0.3);
    vi.restoreAllMocks();
  });

  it('gives colours as Three.js and CSS take them', () => {
    expect(colorNumber('#ff8000')).toBe(0xff8000);
    expect(cssColor({ color: '#ff8000', opacity: 0.5 })).toBe('rgba(255, 128, 0, 0.5)');
  });
});
