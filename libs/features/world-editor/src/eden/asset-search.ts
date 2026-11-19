/** A search of the Asset browser as SQL: its condition (on `entry` and `name` of a table) and the values for it. */
export interface AssetSearch {
  sql: string;
  params: string[];
}

const likeText = (text: string): string => text.replace(/[\\%_]/g, (c) => `\\${c}`);

/**
 * The Asset browser's search (Eden's): an entry number (or a name containing it), `/expression` for a regular
 * expression on the name, `*` and `?` as wildcards on the whole name (`*Guard*`), else a part of the name. Undefined
 * when there is nothing to search.
 */
export function assetSearch(text: string, prefix = ''): AssetSearch | undefined {
  const search = text.trim();
  const [entry, name] = [`${prefix}entry`, `${prefix}name`];
  if (!search) {
    return undefined;
  }
  if (search.startsWith('/') && search.length > 1) {
    return { sql: `${name} REGEXP ?`, params: [search.slice(1)] };
  }
  if (/[*?]/.test(search)) {
    return { sql: `${name} LIKE ?`, params: [likeText(search).replace(/\*/g, '%').replace(/\?/g, '_')] };
  }
  return { sql: `(${entry} = ? OR ${name} LIKE ?)`, params: [/^\d+$/.test(search) ? search : '-1', `%${likeText(search)}%`] };
}
