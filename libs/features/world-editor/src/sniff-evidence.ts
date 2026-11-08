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

/** A spawn of the sniffs, seen once or more (`seen`: how many times, in the files loaded). */
export interface DistinctSniff {
  sniff: SniffSpawn;
  seen: number;
}

/** A sniffed spawn compared with the database: `match` is the database spawn it is, if any. */
export interface SniffEvidence extends DistinctSniff {
  match?: SpawnRecord;
}

const distance2d = (a: { x: number; y: number }, b: { x: number; y: number }): number => Math.hypot(a.x - b.x, a.y - b.y);
const kindOf = (spawn: { type: string; entry: number }): string => `${spawn.type}:${spawn.entry}`;
/** The list of a key in a map of lists, added when it isn't there. */
function listOf<T>(lists: Map<string, T[]>, key: string): T[] {
  const list = lists.get(key) ?? [];
  lists.set(key, list);
  return list;
}

/** The sniffed spawns, each seen once (the same spawn in several sniffs counted), compared by entry only. */
export function distinctSniffs(sniffs: SniffSpawn[]): DistinctSniff[] {
  const byKind = new Map<string, DistinctSniff[]>();
  const distinct: DistinctSniff[] = [];
  for (const sniff of sniffs) {
    const known = listOf(byKind, kindOf(sniff));
    const same = known.find((other) => distance2d(other.sniff, sniff) <= SNIFF_SAME_DISTANCE);
    if (same) {
      same.seen++;
    } else {
      const added = { sniff, seen: 1 };
      known.push(added);
      distinct.push(added);
    }
  }
  return distinct;
}

/** The sniffed spawns compared with the spawns of the database (of the same entry, nearby), on the map shown. */
export function sniffEvidence(sniffs: DistinctSniff[], spawns: SpawnRecord[], map: number): SniffEvidence[] {
  const byKind = new Map<string, SpawnRecord[]>();
  for (const spawn of spawns) {
    listOf(byKind, kindOf(spawn)).push(spawn);
  }
  return sniffs
    .filter(({ sniff }) => sniff.map === map)
    .map((distinct) => ({
      ...distinct,
      match: byKind.get(kindOf(distinct.sniff))?.find((spawn) => distance2d(spawn, distinct.sniff) <= SNIFF_MATCH_DISTANCE),
    }));
}

/** Where a sniffed spawn was (its key while it is added, so it isn't added twice). */
export function sniffKey({ sniff }: DistinctSniff): string {
  return `${kindOf(sniff)}:${sniff.x}:${sniff.y}:${sniff.z}`;
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
