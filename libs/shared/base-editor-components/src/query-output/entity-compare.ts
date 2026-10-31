import { Injectable, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';

/** The rows of an entity in an editor, kept to compare another one with (two creatures, say). */
export interface EntitySnapshot {
  table: string;
  id: string;
  rows: TableRow[];
  /** The column telling the rows apart (multi-row editors), with a second one when it alone doesn't (creature_text). */
  key?: string;
  extraKey?: string;
}

/** A value differing between the pinned entity and the one shown (of the row with that key, in multi-row editors). */
export interface CompareDifference {
  row: string;
  field: string;
  pinned: unknown;
  current: unknown;
}

export interface CompareResult {
  differences: CompareDifference[];
  /** The rows (by key) only one of them has. */
  onlyPinned: string[];
  onlyCurrent: string[];
}

/** The entity pinned for comparison (one at a time, for every editor). */
@Injectable({ providedIn: 'root' })
export class EntityCompareService {
  readonly pinned = signal<EntitySnapshot | undefined>(undefined);
}

/**
 * How the entity shown differs from the one pinned: the values of their rows (matched by `key`), leaving out the
 * columns holding each one's own id.
 */
export function compareEntities(pinned: EntitySnapshot, current: EntitySnapshot): CompareResult {
  const keyOf = (row: TableRow, index: number) =>
    pinned.key ? (pinned.extraKey ? `${row[pinned.key]}_${row[pinned.extraKey]}` : String(row[pinned.key])) : String(index);
  const pinnedRows = new Map(pinned.rows.map((row, i) => [keyOf(row, i), row]));
  const currentRows = new Map(current.rows.map((row, i) => [keyOf(row, i), row]));
  const differences: CompareDifference[] = [];
  for (const [key, row] of currentRows) {
    const other = pinnedRows.get(key);
    if (!other) {
      continue;
    }
    for (const field of new Set([...Object.keys(other), ...Object.keys(row)])) {
      const isId = String(other[field]) === pinned.id && String(row[field]) === current.id;
      if (!isId && String(other[field] ?? '') !== String(row[field] ?? '')) {
        differences.push({ row: pinned.key ? key : '', field, pinned: other[field], current: row[field] });
      }
    }
  }
  return {
    differences,
    onlyPinned: [...pinnedRows.keys()].filter((key) => !currentRows.has(key)),
    onlyCurrent: [...currentRows.keys()].filter((key) => !pinnedRows.has(key)),
  };
}
