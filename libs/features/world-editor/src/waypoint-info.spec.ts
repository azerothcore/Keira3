import { describeWaypoint, WaypointSaiRow } from './waypoint-info';

describe('describeWaypoint', () => {
  const scripts = new Map([
    [
      50,
      [
        { id: 50, delay: 0, command: 0 },
        { id: 50, delay: 2, command: 1 },
        { id: 50, delay: 3, command: 99 },
      ],
    ],
  ]);
  const sai = (point: number, pathId: number, comment = '', actionType = 1): WaypointSaiRow => ({
    entryorguid: 197,
    point,
    pathId,
    actionType,
    comment,
  });

  it('says nothing for a plain point', () => {
    expect(describeWaypoint(10, 1, { delay: 0, moveType: 0, action: 0 }, scripts, [])).toEqual([]);
    expect(describeWaypoint(10, 1, {}, scripts, [])).toEqual([]);
  });

  it('tells the wait, the move type, the script and its chance, and the SmartAI reactions', () => {
    expect(
      describeWaypoint(10, 3, { delay: 5000, moveType: 1, action: 50, actionChance: 40 }, scripts, [
        sai(3, 10, 'Marshal - On WP 3 Reached - Say Line 0'),
        sai(0, 0, '', 5),
        sai(0, 0, '', 9999),
        sai(4, 10, 'other point'),
        sai(3, 11, 'other path'),
      ]),
    ).toEqual([
      'wait 5 s',
      'run',
      'script 50 (40%): talk, emote (+2 s), command 99 (+3 s)',
      'SAI: Marshal - On WP 3 Reached - Say Line 0',
      'SAI: play emote',
      'SAI: action 9999',
    ]);
    expect(describeWaypoint(10, 3, { action: 77, actionChance: 100, moveType: 3 }, scripts, [])).toEqual(['take off', 'script 77']);
  });
});
