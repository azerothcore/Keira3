import { SniffSpawn } from '@keira/shared/db-layer';
import { WorldMarker } from '@keira/shared/world-viewer';
import { SpawnRecord } from './world-editor.model';

/** How far around the view the sniffed spawns are read (yards). */
export const SNIFF_RADIUS = 300;
/** A sniffed spawn this close (2D) to a spawn of the same entry in the database is the same one (yards). */
export const SNIFF_MATCH_DISTANCE = 5;
/** Sniffed spawns this close to each other (same entry) are one spawn seen in several sniffs (yards). */
export const SNIFF_SAME_DISTANCE = 2;
export const SNIFF_MISSING_COLOR = 0xff9900;
export const SNIFF_MATCHED_COLOR = 0x888888;

/** A sniffed spawn compared with the database: `match` is the database spawn it is, if any. */
export interface SniffEvidence {
  sniff: SniffSpawn;
  /** How many times it was sniffed (in the files loaded). */
  seen: number;
  match?: SpawnRecord;
}

const distance2d = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);

/** The sniffed spawns, each seen once, compared with the spawns of the database. */
export function sniffEvidence(sniffs: SniffSpawn[], spawns: SpawnRecord[]): SniffEvidence[] {
  const distinct: SniffEvidence[] = [];
  for (const sniff of sniffs) {
    const same = distinct.find(
      (known) =>
        known.sniff.type === sniff.type && known.sniff.entry === sniff.entry && distance2d(known.sniff, sniff) <= SNIFF_SAME_DISTANCE,
    );
    if (same) {
      same.seen++;
    } else {
      distinct.push({ sniff, seen: 1 });
    }
  }
  for (const evidence of distinct) {
    const { sniff } = evidence;
    evidence.match = spawns.find(
      (spawn) => spawn.type === sniff.type && spawn.entry === sniff.entry && distance2d(spawn, sniff) <= SNIFF_MATCH_DISTANCE,
    );
  }
  return distinct;
}

/** The markers of the sniffed spawns: orange when the database has no such spawn, grey when it has. */
export function sniffMarkers(evidence: SniffEvidence[]): WorldMarker[] {
  return evidence.map(({ sniff, seen, match }, i) => ({
    key: `sniff:${i}`,
    position: { x: sniff.x, y: sniff.y, z: sniff.z },
    color: match ? SNIFF_MATCHED_COLOR : SNIFF_MISSING_COLOR,
    label: `Sniff: ${sniff.type} ${sniff.entry} · ${match ? `guid ${match.guid}` : 'not in the database'} · ×${seen}`,
  }));
}

/** The columns of a sniffed creature that wanders, for its INSERT. */
export function sniffFields(sniff: SniffSpawn): Record<string, number> | undefined {
  return sniff.type === 'creature' && sniff.wanderDistance > 0 ? { wander_distance: sniff.wanderDistance, MovementType: 1 } : undefined;
}
