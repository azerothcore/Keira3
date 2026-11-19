import { LOOP_ENDING, pathEnding, PathStart } from './path-ending';
import { WaypointSaiRow } from './waypoint-info';

const row = (extra: Partial<WaypointSaiRow>): WaypointSaiRow => ({
  entryorguid: 1,
  point: 3,
  pathId: 0,
  actionType: 1,
  comment: '',
  ...extra,
});
const start = (extra: Partial<PathStart>): PathStart => ({ owner: 1, pathId: 10, repeat: false, despawn: 0, ...extra });

describe('pathEnding', () => {
  const last = { point: 3 };
  const none = new Map();

  it('starts a waypoint_data path over, unless a script started it not to: then it stays at its last point', () => {
    expect(pathEnding(10, last, [], none, [])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [start({ repeat: true })], none, [])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [start({})], none, [])).toEqual({ kind: 'stay', text: 'stops at the last point (its new home)' });
  });

  it('stops a SmartAI path at its last point, unless started to repeat, and despawns it after the despawn time given', () => {
    expect(pathEnding(-500, last, [], none, [])).toEqual({ kind: 'stay', text: 'stops at the last point' });
    expect(pathEnding(-500, last, [start({ pathId: -500, repeat: true })], none, [])).toBe(LOOP_ENDING);
    expect(pathEnding(-500, last, [start({ pathId: -500, despawn: 3000 })], none, [])).toEqual({
      kind: 'despawn',
      text: 'despawns 3 s after the last point (back at its spawn point after its respawn time)',
    });
  });

  it('despawns or dies when a script at the last point says so', () => {
    const scripts = new Map([
      [50, [{ id: 50, delay: 0, command: 18 }]],
      [51, [{ id: 51, delay: 2, command: 22 }]],
    ]);
    expect(pathEnding(10, { point: 3, action: 50 }, [], scripts, []).kind).toBe('despawn');
    expect(pathEnding(10, { point: 3, action: 51 }, [], scripts, []).text).toBe(
      'dies at the last point (back at its spawn point after its respawn time)',
    );
    // a script that doesn't end it, or none
    expect(pathEnding(10, { point: 3, action: 99 }, [], scripts, [])).toBe(LOOP_ENDING);
    // SmartAI: at the last point exactly (not "any point"), on its kind of path
    expect(pathEnding(10, last, [], none, [row({ actionType: 41 })]).kind).toBe('despawn');
    expect(pathEnding(10, last, [], none, [row({ actionType: 37, pathId: 10 })]).kind).toBe('die');
    expect(pathEnding(10, last, [], none, [row({ actionType: 51, targetType: 1 })]).kind).toBe('die');
    expect(pathEnding(10, last, [], none, [row({ actionType: 51, targetType: 2 })])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [], none, [row({ actionType: 41, point: 0 })])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [], none, [row({ actionType: 41, pathId: 11 })])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [], none, [row({ actionType: 41, escort: true })])).toBe(LOOP_ENDING);
    expect(pathEnding(-500, last, [], none, [row({ actionType: 41, escort: true, pathId: -500 })]).kind).toBe('despawn');
  });

  it('despawns or dies on "path ended" rows: always on SmartAI paths, only for waypoint_data paths that do not repeat', () => {
    const ended = row({ actionType: 41, ended: true, point: 0 });
    expect(pathEnding(10, last, [], none, [ended])).toBe(LOOP_ENDING);
    expect(pathEnding(10, last, [start({})], none, [ended]).kind).toBe('despawn');
    expect(pathEnding(10, last, [start({})], none, [{ ...ended, point: 2 }]).kind).toBe('stay');
    expect(pathEnding(-500, last, [start({ pathId: -500, repeat: true })], none, [{ ...ended, escort: true }]).kind).toBe('despawn');
  });
});
