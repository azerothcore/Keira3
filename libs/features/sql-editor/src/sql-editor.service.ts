import { LanguageDescription } from '@codemirror/language';
import { MySQL, sql } from '@codemirror/lang-sql';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { githubLight } from '@uiw/codemirror-theme-github';
import { computed, inject, Injectable, signal } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';

export type SqlSchema = Record<string, string[]>;

@Injectable({
  providedIn: 'root',
})
export class SqlEditorService {
  private readonly mysqlQueryService = inject(MysqlQueryService);

  code =
    'SELECT `entry`, `name`, `subname`, `minlevel`, `maxlevel`, `AIName`, `ScriptName` \n' +
    'FROM `creature_template` \n' +
    'WHERE `entry` > 100 \n' +
    'ORDER BY `entry` ASC \n' +
    'LIMIT 100';

  readonly schema = signal<SqlSchema>({});

  readonly schemaLoading = signal(false);

  readonly languages = computed<LanguageDescription[]>(() => [
    LanguageDescription.of({
      name: 'MySQL',
      support: sql({
        dialect: MySQL,
        upperCaseKeywords: true,
        schema: this.schema(),
      }),
    }),
  ]);

  readonly extensions = computed(() => [
    githubLight,
    sql({
      dialect: MySQL,
      upperCaseKeywords: true,
      schema: this.schema(),
    }),
  ]);

  loadSchema(): void {
    this.schemaLoading.set(true);

    this.mysqlQueryService
      .getTables()
      .pipe(
        map((tableRows: TableRow[]) => {
          return tableRows.map((row) => Object.values(row)[0] as string);
        }),
        switchMap((tableNames: string[]) => {
          if (tableNames.length === 0) {
            return of({} as SqlSchema);
          }
          return forkJoin(
            Object.fromEntries(
              tableNames.map((tableName) => [
                tableName,
                this.mysqlQueryService.getColumns(tableName).pipe(
                  map((colRows: TableRow[]) => {
                    return colRows.map((col) => col['Field'] as string).filter(Boolean);
                  }),
                ),
              ]),
            ),
          );
        }),
      )
      .subscribe({
        next: (schemaMap) => {
          this.schema.set(schemaMap as SqlSchema);
          this.schemaLoading.set(false);
        },
        error: () => {
          this.schemaLoading.set(false);
        },
      });
  }
}
