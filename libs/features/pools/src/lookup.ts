import { signal, Signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { Observable, Subscription } from 'rxjs';

/**
 * Rows read by id as they're needed (the names of a pool's members, say): `need(ids)` reads the ones not read yet,
 * `get(id)` gives the row (null: none with that id; undefined: not read yet).
 */
export class Lookup {
  private readonly _rows = signal<Map<number, TableRow | null>>(new Map());
  /** The ids being read (not asked again meanwhile). */
  private readonly pending = new Set<number>();
  readonly rows: Signal<Map<number, TableRow | null>> = this._rows.asReadonly();

  constructor(
    private readonly query: (sql: string) => Observable<TableRow[]>,
    /** The query reading the given ids (a list for `IN (…)`), each row with the id as `id`. */
    private readonly sql: (ids: string) => string,
  ) {}

  get(id: number): TableRow | null | undefined {
    return this._rows().get(id);
  }

  need(ids: number[]): Subscription | undefined {
    const known = this._rows();
    const unknown = [...new Set(ids.map((id) => Math.trunc(Number(id))))].filter((id) => !known.has(id) && !this.pending.has(id));
    if (!unknown.length) {
      return undefined;
    }
    unknown.forEach((id) => this.pending.add(id));
    const done = () => unknown.forEach((id) => this.pending.delete(id));
    return this.query(this.sql(unknown.join(', '))).subscribe({
      next: (rows) => {
        done();
        const next = new Map(this._rows());
        unknown.forEach((id) => next.set(id, null));
        (rows ?? []).forEach((row) => next.set(Number(row['id']), row));
        this._rows.set(next);
      },
      error: () => done(),
    });
  }
}
