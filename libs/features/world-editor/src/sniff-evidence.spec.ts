import { SniffSpawn } from '@keira/shared/db-layer';
import { distinctSniffs, SNIFF_MATCHED_COLOR, SNIFF_MISSING_COLOR, sniffEvidence, sniffFields, sniffKey, sniffMarkers } from './sniff-evidence';
import { SpawnRecord } from './world-editor.model';

const sniff = (type: SniffSpawn['type'], entry: number, x: number, wanderDistance = 0): SniffSpawn => ({
  type,
  entry,
  map: 0,
  x,
  y: 0,
  z: 1,
  o: 0,
  wanderDistance,
  movementType: 0,
  file: 1,
});
const spawn = (type: SpawnRecord['type'], guid: number, entry: number, x: number): SpawnRecord => ({
  type,
  guid,
  entry,
  name: '',
  map: 0,
  x,
  y: 0,
  z: 1,
  o: 0,
  pathId: 0,
});

describe('sniff evidence', () => {
  it('counts a spawn sniffed several times once, and finds it in the database', () => {
    const evidence = sniffEvidence(
      distinctSniffs([
        sniff('creature', 1, 0),
        sniff('creature', 1, 1),
        sniff('creature', 1, 10),
        sniff('gameobject', 1, 0),
        sniff('creature', 2, 0),
        { ...sniff('creature', 3, 0), map: 1 },
      ]),
      [spawn('creature', 7, 1, 4), spawn('gameobject', 8, 1, 50), spawn('creature', 9, 1, 100)],
      0,
    );
    expect(evidence.map(({ sniff, seen, match }) => [sniff.type, sniff.entry, sniff.x, seen, match?.guid])).toEqual([
      ['creature', 1, 0, 2, 7],
      ['creature', 1, 10, 1, undefined],
      ['gameobject', 1, 0, 1, undefined],
      ['creature', 2, 0, 1, undefined],
    ]);
    const markers = sniffMarkers(evidence);
    expect(markers.map((marker) => marker.color)).toEqual([
      SNIFF_MATCHED_COLOR,
      SNIFF_MISSING_COLOR,
      SNIFF_MISSING_COLOR,
      SNIFF_MISSING_COLOR,
    ]);
    expect(markers[0]).toEqual({ key: 'sniff:0', position: { x: 0, y: 0, z: 1 }, color: SNIFF_MATCHED_COLOR, label: 'Sniff: creature 1 · guid 7 · ×2' });
  });

  it('keys a sniffed spawn by where it was', () => {
    expect(sniffKey({ sniff: sniff('creature', 1, 2), seen: 1 })).toBe('creature:1:2:0:1');
  });

  it('keeps the wandering of a creature', () => {
    expect(sniffFields(sniff('creature', 1, 0, 5))).toEqual({ wander_distance: 5, MovementType: 1 });
    expect(sniffFields(sniff('creature', 1, 0))).toBeUndefined();
    expect(sniffFields(sniff('gameobject', 1, 0, 5))).toBeUndefined();
  });
});
