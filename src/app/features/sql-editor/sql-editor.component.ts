import { Component, } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { MysqlError } from 'mysql';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { TableRow } from '@keira-types/general';
import { DTCFG } from '@keira-config/datatable.config';

@Component({
  selector: 'keira-sql-editor',
  templateUrl: './sql-editor.component.html',
  styleUrls: ['./sql-editor.component.scss']
})
export class SqlEditorComponent extends SubscriptionHandler {
  public readonly DTCFG = DTCFG;
  public readonly docUrl = 'https://www.w3schools.com/sql/sql_intro.asp';
  private readonly MAX_COL_SHOWN = 20;

  // displayLimit = 10;
  // get displayLimitOptions() {
  //   return [10, 20, 50, 100, 200, 500, 1000];
  // }

  code = 'SELECT `entry`, `name`, `subname`, `minlevel`, `maxlevel`, `AIName`, `ScriptName` \n' +
    'FROM `creature_template` \n' +
    'WHERE `entry` > 100 \n' +
    'ORDER BY `entry` ASC \n' +
    'LIMIT 100';
  private _error: MysqlError;
  get error(): MysqlError {
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
  ) {
    super();
  }

  copy() {
    this.clipboardService.copyFromContent(this.code);
  }

  execute() {
    this.subscriptions.push(this.mysqlQueryService.query(this.code).subscribe(
      (rows: TableRow[] | { affectedRows: number, message: string }) => {
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
      }, (error: MysqlError) => {
        this._error = error;
        this._rows = [];
        this._columns = [];
      }));
  }
}
