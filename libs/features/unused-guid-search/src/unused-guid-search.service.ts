import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Observable, catchError, map, throwError } from 'rxjs';

export const MAX_INT_UNSIGNED_VALUE = 4294967295;

export type DbOptions = {
  table: string;
  key: string;
  label: string;
};

@Injectable({
  providedIn: 'root',
})
export class UnusedGuidService {
  private readonly mysql = inject(MysqlQueryService);

  public search(selectedDb: DbOptions, startIndex: number, amount: number, consecutive: boolean): Observable<string[]> {
    const query = `SELECT ${selectedDb.key} AS guid
                   FROM ${selectedDb.table}
                   WHERE ${selectedDb.key} >= ${startIndex}`;
    return this.mysql.query<{ guid: number }>(query).pipe(
      map((rows) => {
        const usedGuids = new Set(rows.map((r) => Number(r.guid)));
        let numbers: number[];
        if (consecutive) {
          numbers = this.findConsecutiveUnusedGuids(usedGuids, startIndex, amount);
        } else {
          numbers = this.findUnusedGuids(usedGuids, startIndex, amount);
        }
        return numbers.map(String);
      }),
      catchError((err) => {
        return throwError(() => new Error(err.message));
      }),
    );
  }

  private findUnusedGuids(usedGuids: Set<number>, startIndex: number, amount: number): number[] {
    let current = startIndex;

    const found: number[] = [];

    while (found.length < amount) {
      if (!usedGuids.has(current)) {
        found.push(current);
      }
      current++;
      if (current >= MAX_INT_UNSIGNED_VALUE) {
        break;
      }
    }
    return found;
  }

  private findConsecutiveUnusedGuids(usedGuids: Set<number>, startIndex: number, amount: number): number[] {
    let current = startIndex;

    let streak = 0;
    let streakStart = current;

    const found: number[] = [];

    while (found.length < amount) {
      if (!usedGuids.has(current)) {
        streak++;

        if (streak === 1) {
          streakStart = current;
        }

        if (streak === amount) {
          for (let i = 0; i < amount; i++) {
            found.push(streakStart + i);
          }
          break;
        }
      } else {
        streak = 0;
      }

      current++;
      if (current >= MAX_INT_UNSIGNED_VALUE) {
        break;
      }
    }

    return found;
  }
}
