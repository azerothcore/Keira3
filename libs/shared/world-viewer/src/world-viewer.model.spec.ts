import { parseWaypointKey, waypointKey } from './world-viewer.model';

describe('waypoint keys', () => {
  it('round-trips path key and point', () => {
    expect(waypointKey('path:12#x', 3)).toBe('path:12#x#3');
    expect(parseWaypointKey('path:12#x#3')).toEqual({ pathKey: 'path:12#x', point: 3 });
  });

  it('rejects keys that are not waypoint keys', () => {
    expect(parseWaypointKey('creature:1')).toBeUndefined();
    expect(parseWaypointKey('#3')).toBeUndefined();
    expect(parseWaypointKey('path:1#x')).toBeUndefined();
  });
});
