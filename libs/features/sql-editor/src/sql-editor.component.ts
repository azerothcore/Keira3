import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
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

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss'],
  standalone: true,
  imports: [TooltipModule, FormsModule, QueryErrorComponent, NgxDatatableModule, TranslateModule],
})
export class SqlEditorComponent extends SubscriptionHandler {
  readonly DTCFG = DTCFG;
  readonly docUrl = 'https://www.w3schools.com/sql/sql_intro.asp';
  private readonly MAX_COL_SHOWN = 20;

  // displayLimit = 10;
  // get displayLimitOptions() {
  //   return [10, 20, 50, 100, 200, 500, 1000];
  // }

  private _error: QueryError;
  get error(): QueryError {
    return this._error;
  }

  private _rows: TableRow[] = [];
  get rows(): TableRow[] {
    return this._rows;
  }

  private _columns: string[];
  get columns(): string[] {
    return this._columns;
  }

  private _affectedRows: number;
  get affectedRows(): number {
    return this._affectedRows;
  }

  private _message: string;
  get message(): string {
    return this._message;
  }

  constructor(
    private mysqlQueryService: MysqlQueryService,
    private clipboardService: ClipboardService,
    readonly service: SqlEditorService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    super();
  }

  copy(): void {
    this.clipboardService.copyFromContent(this.service.code);
  }

  execute(): void {
    this.subscriptions.push(
      this.mysqlQueryService.query(this.service.code).subscribe({
        next: (rows: TableRow[] | { affectedRows: number; message: string }) => {
          this._error = null;
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
