import { computed, Injectable, signal } from '@angular/core';

/** A query kept in the session's SQL, from an editor. */
export interface SessionSqlEntry {
  id: number;
  /** The table and entity it's about (`creature_template 1234`). */
  label: string;
  query: string;
  /** When it was added (ISO date). */
  at: string;
}

export const SESSION_SQL_KEY = 'keira3.sessionSql';

/**
 * The SQL put aside while editing (#1086, #401): each editor's query can be added ("To the session"), then all of
 * them reviewed together, copied, saved as one .sql file or executed at once. Kept on this computer until cleared.
 */
@Injectable({ providedIn: 'root' })
export class SessionSqlService {
  private readonly _entries = signal<SessionSqlEntry[]>(this.load());
  readonly entries = this._entries.asReadonly();
  /** All the queries, in the order they were added, each under its label. */
  readonly combined = computed(() =>
    this._entries()
      .map((entry) => `-- ${entry.label}\n${entry.query.trim()}\n`)
      .join('\n'),
  );

  add(label: string, query: string): void {
    if (!query.trim()) {
      return;
    }
    const entries = this._entries();
    const id = entries.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
    this.set([...entries, { id, label, query, at: new Date().toISOString() }]);
  }

  remove(id: number): void {
    this.set(this._entries().filter((entry) => entry.id !== id));
  }

  /** Moves an entry up (-1) or down (+1). */
  move(id: number, by: -1 | 1): void {
    const entries = [...this._entries()];
    const at = entries.findIndex((entry) => entry.id === id);
    const to = at + by;
    if (at < 0 || to < 0 || to >= entries.length) {
      return;
    }
    [entries[at], entries[to]] = [entries[to], entries[at]];
    this.set(entries);
  }

  clear(): void {
    this.set([]);
  }

  private set(entries: SessionSqlEntry[]): void {
    this._entries.set(entries);
    try {
      localStorage.setItem(SESSION_SQL_KEY, JSON.stringify(entries));
    } catch {
      // (storage blocked or full: kept until Keira closes)
    }
  }

  private load(): SessionSqlEntry[] {
    try {
      const stored = JSON.parse(localStorage.getItem(SESSION_SQL_KEY) ?? '[]') as unknown;
      return Array.isArray(stored)
        ? stored.filter((entry): entry is SessionSqlEntry => typeof entry?.query === 'string' && typeof entry?.label === 'string')
        : [];
    } catch {
      return [];
    }
  }
}
