import { signal } from '@angular/core';

/** The column a table is sorted by, and which way (1: up, -1: down). */
export interface SortBy {
  key: string;
  dir: 1 | -1;
}

/**
 * A table sorted by its columns, like the editors' tables: a header clicked sorts up, again down, a third time as it
 * was. `keys` gives each sortable column's value of a row (numbers compared as numbers, text naturally: "a2" < "a10").
 */
export class TableSort<T> {
  readonly by = signal<SortBy | undefined>(undefined);

  constructor(private readonly keys: Record<string, (row: T) => string | number>) {}

  toggle(key: string): void {
    const by = this.by();
    this.by.set(by?.key !== key ? { key, dir: 1 } : by.dir === 1 ? { key, dir: -1 } : undefined);
  }

  /** The arrow of a column's header. */
  icon(key: string): string {
    const by = this.by();
    return by?.key !== key ? 'fa-sort' : by.dir === 1 ? 'fa-sort-up' : 'fa-sort-down';
  }

  apply(rows: T[]): T[] {
    const by = this.by();
    if (!by) {
      return rows;
    }
    const value = this.keys[by.key];
    return [...rows].sort((a, b) => {
      const [x, y] = [value(a), value(b)];
      const order =
        typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
      return order * by.dir;
    });
  }
}
