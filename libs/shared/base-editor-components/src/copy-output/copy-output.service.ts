import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { RelatedTable, RelatedTableState } from './copy-output.model';
import { forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CopyOutputService {
  constructor(private queryService: MysqlQueryService) {}

  computeRelatedTableStates(inputTables: RelatedTable[], sourceId: string | number, mainTableName: string) {
    if (!inputTables || inputTables.length === 0) {
      return of<RelatedTableState[]>([]);
    }

    const observables = inputTables.map((table) =>
      this.queryService.getRowsCount(table.tableName, table.idField, sourceId).pipe(
        map((count) => {
          const num = Number(count || 0);
          const isMain = table.tableName === mainTableName;

          if (isMain || num > 0) {
            return {
              tableName: table.tableName,
              idField: table.idField,
              count: num,
              included: true,
              copyMode: table.copyMode || 'RAW',
              columns: table.columns,
            } as RelatedTableState;
          }

          return null as any;
        }),
      ),
    );

    return forkJoin(observables).pipe(map((results) => results.filter((r) => !!r) as RelatedTableState[]));
  }

  generateCopyQueryForStates(
    states: RelatedTableState[],
    sourceId: string | number,
    newId: string | number,
    mainTableName: string,
    mainIdField: string,
  ) {
    const setVars = this.queryService.getCopyVarsSet(sourceId, newId);

    const selectedTables = (states || []).filter((t) => t.included);

    if (selectedTables.length === 0) {
      const q = setVars + this.queryService.getCopyQuery(mainTableName, sourceId, newId, mainIdField, true);
      return of(q);
    }

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
          const cols = table.columns && table.columns.length > 0 ? table.columns : rows[0] ? Object.keys(rows[0]) : [];
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
