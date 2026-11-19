import { addUserPin, loadUserPins, MAX_USER_PINS, pathLength, saveUserPins, USER_PINS_KEY } from './game-map-marks';

describe('game map marks', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the pins, newest first, at most so many', () => {
    expect(loadUserPins()).toEqual([]);
    let pins = addUserPin([], { mapId: 0, x: 1, y: 2 }, 'Elwynn Forest', 1000);
    pins = addUserPin(pins, { mapId: 1, x: 3, y: 4 }, 'Durotar', 1000);
    expect(pins.map((pin) => [pin.id, pin.label])).toEqual([
      [1001, 'Durotar'],
      [1000, 'Elwynn Forest'],
    ]);
    saveUserPins(pins);
    expect(loadUserPins()).toEqual(pins);
    for (let i = 0; i < MAX_USER_PINS; i++) {
      pins = addUserPin(pins, { mapId: 0, x: i, y: 0 }, '');
    }
    expect(pins).toHaveLength(MAX_USER_PINS);
  });

  it('drops what is not a pin, and survives broken or blocked storage', () => {
    localStorage.setItem(USER_PINS_KEY, JSON.stringify([{ id: 1, mapId: 0, x: 1, y: 2, at: 3, label: 'ok' }, { id: 'x' }, null]));
    expect(loadUserPins().map((pin) => pin.label)).toEqual(['ok']);
    localStorage.setItem(USER_PINS_KEY, '{"not":"a list"}');
    expect(loadUserPins()).toEqual([]);
    localStorage.setItem(USER_PINS_KEY, '{broken');
    expect(loadUserPins()).toEqual([]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(() => saveUserPins([])).not.toThrow();
  });

  it('measures a line, starting over on another map', () => {
    expect(pathLength([])).toBe(0);
    expect(
      pathLength([
        { mapId: 0, x: 0, y: 0 },
        { mapId: 0, x: 3, y: 4 },
        { mapId: 1, x: 100, y: 100 },
        { mapId: 1, x: 100, y: 110 },
      ]),
    ).toBe(15);
  });
});
