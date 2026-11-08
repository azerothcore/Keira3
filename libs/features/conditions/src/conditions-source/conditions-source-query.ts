import { CONDITIONS_TABLE, Conditions } from '@keira/shared/acore-world-model';
import { escape } from 'sqlstring';

/** The columns telling a source of conditions (SourceType, SourceGroup, SourceEntry, SourceId). */
export const CONDITIONS_SOURCE_FIELDS: (keyof Conditions)[] = ['SourceTypeOrReferenceId', 'SourceGroup', 'SourceEntry', 'SourceId'];
/** The columns telling apart the conditions of one source (with the source, the table's key). */
export const CONDITION_ROW_FIELDS: (keyof Conditions)[] = [
  'ElseGroup',
  'ConditionTypeOrReference',
  'ConditionTarget',
  'ConditionValue1',
  'ConditionValue2',
  'ConditionValue3',
];

const value = (cell: unknown): string => (typeof cell === 'number' ? String(cell) : escape(cell ?? ''));

/** The id of a condition among its source's: its key columns. */
export function conditionRowId(row: Pick<Conditions, (typeof CONDITION_ROW_FIELDS)[number]>): string {
  return CONDITION_ROW_FIELDS.map((field) => row[field]).join('_');
}

/**
 * All the conditions of a source, as they are now: the source's rows deleted, these inserted (#3154). The table has no
 * single row id, so a change is written as the whole source again.
 */
export function conditionsSourceQuery(source: Partial<Conditions>, rows: Conditions[]): string {
  const where = CONDITIONS_SOURCE_FIELDS.map((field) => `\`${field}\` = ${value(source[field] ?? 0)}`).join(' AND ');
  let query = `DELETE FROM \`${CONDITIONS_TABLE}\` WHERE ${where};\n`;
  if (rows.length) {
    const columns = Object.keys(new Conditions()) as (keyof Conditions)[];
    query += `INSERT INTO \`${CONDITIONS_TABLE}\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES\n`;
    query += rows.map((row) => `(${columns.map((column) => value(row[column])).join(', ')})`).join(',\n') + ';\n';
  }
  return query;
}
