import { objectRange, preferredPathId, parseSpawnKey, pathKey, spawnKey } from './world-editor.model';

describe('world editor keys', () => {
  it('builds and parses spawn keys', () => {
    expect(spawnKey('creature', 12)).toBe('creature:12');
    expect(parseSpawnKey('gameobject:7')).toEqual({ type: 'gameobject', guid: 7 });
    expect(parseSpawnKey('path:1#2')).toBeUndefined();
  });

  it('builds path keys and default path ids', () => {
    expect(pathKey(120)).toBe('path:120');
    expect(preferredPathId(12)).toBe(120);
  });

  it('tells the range of gameobject templates', () => {
    expect(objectRange({ type: 29, data: [60, 0, 0] })).toBe(60);
    expect(objectRange({ type: 6, data: [0, 0, 10] })).toBe(5);
    expect(objectRange({ type: 8, data: [1, 15, 0] })).toBe(15);
    expect(objectRange({ type: 3, data: [9, 9, 9] })).toBe(0);
  });
});
