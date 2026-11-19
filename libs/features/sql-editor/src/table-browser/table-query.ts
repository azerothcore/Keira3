import { escape } from 'sqlstring';

export type TableOperator = '=' | '!=' | '<' | '>' | '<=' | '>=' | 'LIKE' | 'NOT LIKE' | 'IN' | 'IS NULL' | 'IS NOT NULL';
export const TABLE_OPERATORS: TableOperator[] = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

/** One condition of a search: a column, how it compares, a value, and how it joins the previous one. */
export interface TableCondition {
  join: 'AND' | 'OR';
  field: string;
  operator: TableOperator;
  value: string;
}

const quoteName = (name: string): string => `\`${name.replace(/`/g, '``')}\``;

/** A value as MySQL reads it: a number as it is, text escaped; `IN` takes a comma-separated list. */
function sqlValue(operator: TableOperator, value: string): string {
  const one = (text: string): string => (/^-?\d+(\.\d+)?$/.test(text.trim()) ? text.trim() : escape(text));
  if (operator === 'IN') {
    return `(${
      value
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length)
        .map(one)
        .join(', ') || 'NULL'
    })`;
  }
  return one(value);
}

/**
 * The SELECT of a table searched by conditions (#1305): only the table's own columns are used, values are escaped,
 * the rows limited.
 */
export function tableQuery(table: string, columns: string[], conditions: TableCondition[], limit: number): string {
  const where = conditions
    .filter((condition) => columns.includes(condition.field))
    .map((condition, i) => {
      const test = condition.operator.startsWith('IS')
        ? `${quoteName(condition.field)} ${condition.operator}`
        : `${quoteName(condition.field)} ${condition.operator} ${sqlValue(condition.operator, condition.value)}`;
      return i === 0 ? test : `${condition.join} ${test}`;
    })
    .join(' ');
  return `SELECT * FROM ${quoteName(table)}${where ? ` WHERE ${where}` : ''} LIMIT ${Math.max(1, Math.trunc(limit) || 100)}`;
}
