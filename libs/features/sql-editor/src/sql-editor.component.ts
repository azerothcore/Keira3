import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { DTCFG } from '@keira/shared/config';
import { SubscriptionHandler } from '@keira/shared/utils';
import { TableRow } from '@keira/shared/constants';
import { QueryError } from 'mysql2';
import { ClipboardService } from 'ngx-clipboard';
import { SqlEditorService } from './sql-editor.service';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QueryErrorComponent } from '@keira/shared/base-editor-components';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { CodeEditor } from '@acrodata/code-editor';
import { LanguageDescription } from '@codemirror/language';
import { MySQL, sql } from '@codemirror/lang-sql';
import { githubLight } from '@uiw/codemirror-theme-github';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss'],
  imports: [CodeEditor, TooltipModule, FormsModule, QueryErrorComponent, NgxDatatableModule, TranslateModule],
})
export class SqlEditorComponent extends SubscriptionHandler {
  private readonly mysqlQueryService = inject(MysqlQueryService);
  private readonly clipboardService = inject(ClipboardService);
  protected readonly service = inject(SqlEditorService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly DTCFG = DTCFG;
  protected readonly docUrl = 'https://www.w3schools.com/sql/sql_intro.asp';
  private readonly MAX_COL_SHOWN = 20;

  protected readonly languages = [LanguageDescription.of({ name: 'MySQL', support: sql({ dialect: MySQL, upperCaseKeywords: true }) })];
  protected readonly extensions = [githubLight];

  private _error: QueryError | undefined;
  protected get error(): QueryError | undefined {
    return this._error;
  }

  private _rows: TableRow[] = [];
  protected get rows(): TableRow[] {
    return this._rows;
  }

  private _columns!: string[];
  protected get columns(): string[] {
    return this._columns;
  }

  private _affectedRows!: number;
  protected get affectedRows(): number {
    return this._affectedRows;
  }

  private _message!: string;
  protected get message(): string {
    return this._message;
  }

  protected copy(): void {
    this.clipboardService.copyFromContent(this.service.code);
  }

  protected execute(): void {
    this.subscriptions.push(
      this.mysqlQueryService.query(this.service.code).subscribe({
        next: (rows: TableRow[] | { affectedRows: number; message: string }) => {
          this._error = undefined;
          this._affectedRows = -1;

          if (!Array.isArray(rows)) {
            this._affectedRows = rows.affectedRows;
            this._message = rows.message;
          } else if (rows.length > 0) {
            const columns = Object.keys(rows[0]);

            if (columns.length > this.MAX_COL_SHOWN) {
              this._columns = columns.slice(0, this.MAX_COL_SHOWN);
            } else {
              this._columns = columns;
            }
          } else {
            this._columns = [];
          }

          this._rows = rows as TableRow[];
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          this._error = error;
          this._rows = [];
          this._columns = [];
        },
      }),
    );
  }
}
