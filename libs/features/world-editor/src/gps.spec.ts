import { parseGpsOutput } from './gps';

describe('parseGpsOutput', () => {
  it('reads the .gps output copied from the chat', () => {
    const text = `[23:18:23] Map: 0 (Eastern Kingdoms) Zone: 12 (Elwynn Forest) Area: 87 (Goldshire) Phase: 1
[23:18:23] X: -9466.308 Y: -11.60754 Z: 49.794136 Orientation: 4.5729585`;
    expect(parseGpsOutput(text)).toEqual({ map: 0, x: -9466.308, y: -11.60754, z: 49.794136, o: 4.5729585 });
  });

  it('needs the map, the three coordinates and the orientation', () => {
    expect(parseGpsOutput('X: 1 Y: 2 Z: 3 Orientation: 0')).toBeUndefined();
    expect(parseGpsOutput('Map: 1 X: 1 Y: 2 Orientation: 0')).toBeUndefined();
    expect(parseGpsOutput('Northshire')).toBeUndefined();
    // "grid X" or "MaxY" words don't count as coordinates
    expect(parseGpsOutput('Map: 1 MaxY: 9 X: 1 Y: 2 Z: 3 Orientation: 0')?.y).toBe(2);
  });
});
