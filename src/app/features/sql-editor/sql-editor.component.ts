import { Component, } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { MysqlError } from 'mysql';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
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

  // displayLimit = 10;
  // get displayLimitOptions() {
  //   return [10, 20, 50, 100, 200, 500, 1000];
  // }

  code = 'SELECT `entry`, `name`, `subname`, `minlevel`, `maxlevel`, `AIName`, `ScriptName` \n' +
    'FROM `creature_template` \n' +
    'WHERE `entry` > 100 \n' +
    'ORDER BY `entry` ASC LIMIT 100';

  private _error: MysqlError;
  get error(): MysqlError {
    return this._error;
  }

  private _rows: TableRow[] = [];
  get rows(): TableRow[] {
    return this._rows;
  }

  private _columns;
  get columns() {
    return this._columns;
  }

  constructor(
    private mysqlQueryService: MysqlQueryService,
    private sqliteQueryService: SqliteQueryService,
    private clipboardService: ClipboardService,
  ) {
    super();
  }

  copy() {
    this.clipboardService.copyFromContent(this.code);
  }

  execute() {
    this.subscriptions.push(this.mysqlQueryService.query(this.code).subscribe(rows => {
      if (rows?.length > 0) {
        this._columns = Object.keys(rows[0]);
      }

      this._rows = rows;
    }, (error: MysqlError) => {
      this._error = error;
    }));
  }
}
