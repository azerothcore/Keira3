import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { RelatedTable, RelatedTableState } from './copy-output.model';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CopyOutputService {
  private readonly queryService = inject(MysqlQueryService);

  computeRelatedTableStates(inputTables: RelatedTable[], sourceId: string | number, mainTableName: string) {
    const observables = inputTables.map((table) =>
      this.queryService.getRowsCount(table.tableName, table.idField, sourceId).pipe(
        map((count): RelatedTableState | null => {
          const num = Number(count ?? 0);
          // (the main table always, the others when the source has rows there)
          return table.tableName === mainTableName || num > 0
            ? {
                tableName: table.tableName,
                idField: table.idField,
                count: num,
                included: true,
                copyMode: table.copyMode ?? 'RAW',
                columns: table.columns,
              }
            : null;
        }),
      ),
    );

    return forkJoin(observables).pipe(map((results) => results.filter((r): r is RelatedTableState => !!r)));
  }

  generateCopyQueryForStates(
    states: RelatedTableState[],
    sourceId: string | number,
    newId: string | number,
    mainTableName: string,
    mainIdField: string,
  ) {
    const setVars = this.queryService.getCopyVarsSet(sourceId, newId);

    const selectedTables = states.filter((t) => t.included);

    const hasAnyRaw = selectedTables.some((t) => t.copyMode === 'RAW');

    if (!hasAnyRaw) {
      let query = setVars;
      for (const table of selectedTables) {
        query += '\n' + this.queryService.getCopyQuery(table.tableName, sourceId, newId, table.idField, true);
      }
      return of(query);
    }

    const rawTables = selectedTables.filter((t) => t.copyMode === 'RAW');
    const rawObservables = rawTables.map((table) =>
      this.queryService.selectAll(table.tableName, table.idField, sourceId).pipe(
        map((rows) => {
          // (no columns given: the rows' own, as getCopyQueryRawWithValues does)
          const cols = table.columns ?? [];
          const rawQuery = this.queryService.getCopyQueryRawWithValues(table.tableName, rows, newId, table.idField, cols, true);
          return { tableName: table.tableName, rawQuery };
        }),
      ),
    );

    return forkJoin(rawObservables).pipe(
      map((raws) => {
        const tableQueries = new Map(raws.map((r) => [r.tableName, r.rawQuery]));
        let finalQuery = setVars;
        for (const t of selectedTables) {
          if (t.copyMode === 'RAW') {
            finalQuery += '\n' + tableQueries.get(t.tableName);
          } else {
            finalQuery += '\n' + this.queryService.getCopyQuery(t.tableName, sourceId, newId, t.idField, true);
          }
        }
        return finalQuery;
      }),
    );
  }
}
