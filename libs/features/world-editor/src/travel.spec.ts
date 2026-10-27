import { EMPTY_TRAVEL, travelOverlays } from './travel';

describe('travel overlays', () => {
  const data = {
    ...EMPTY_TRAVEL,
    mapId: 0,
    graveyards: [
      { id: 1, x: 1, y: 2, z: 3, comment: 'Goldshire' },
      { id: 2, x: 4, y: 5, z: 6, comment: '' },
    ],
    teleports: [
      { id: 45, name: 'Deadmines', map: 36, x: 1, y: 2, z: 3 },
      { id: 46, name: '', map: 0, x: 100, y: 100, z: 10 },
      { id: 47, name: 'Lost', map: 0, x: 0, y: 0, z: 0 },
      { id: 48, name: 'Unknown map', map: 999, x: 0, y: 0, z: 0 },
    ],
    taxiNodes: [{ id: 2, mapId: 0, x: 10, y: 10, z: 10, name: 'Stormwind' }],
    taxiPaths: [
      {
        id: 10,
        from: 2,
        to: 4,
        points: [
          { x: 0, y: 0, z: 0 },
          { x: 50, y: 0, z: 0 },
          { x: 100, y: 0, z: 0 },
        ],
      },
      {
        id: 11,
        from: 2,
        to: 5,
        points: [
          { x: 5000, y: 5000, z: 0 },
          { x: 5100, y: 5000, z: 0 },
        ],
      },
      { id: 12, from: 2, to: 6, points: [{ x: 0, y: 0, z: 0 }] },
    ],
  };
  const triggers = [
    { id: 45, mapId: 0, x: -10, y: -10, z: 0, radius: 5 },
    { id: 46, mapId: 0, x: -20, y: -20, z: 0, radius: 5 },
    { id: 48, mapId: 0, x: -30, y: -30, z: 0, radius: 5 },
  ];

  it('marks graveyards, flight masters and teleports, and draws teleports and flight paths near the camera', () => {
    const { links, markers } = travelOverlays(data, triggers, new Map([[36, 'The Deadmines']]), { x: 0, y: 0, z: 0 });
    expect(markers.map((m) => m.label)).toEqual([
      'Graveyard 1: Goldshire',
      'Graveyard 2',
      'Flight master: Stormwind (node 2)',
      'Teleport: Deadmines → The Deadmines (1.0, 2.0, 3.0)',
      'Teleport destination: area trigger 46',
      'Teleport: Unknown map → map 999 (0.0, 0.0, 0.0)',
    ]);
    expect(links.map((l) => l.key)).toEqual(['flight:10', 'teleport:46']);
    expect(links[0].via).toEqual([{ x: 50, y: 0, z: 0 }]);
    expect(links[0].label).toBe('Flight path 10: Stormwind → node 4');
    // no camera yet: no flight paths
    expect(travelOverlays(data, triggers, new Map(), undefined).links.map((l) => l.key)).toEqual(['teleport:46']);
  });
});
