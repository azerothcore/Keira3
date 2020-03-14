import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs/operators';

import { MysqlService } from '../shared/services/mysql.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ElectronService } from '@keira-shared/services/electron.service';

@Component({
  selector: 'keira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  sqliteResult: { id: number; name: string };

  constructor(
    public mysqlService: MysqlService,
    public toastrService: ToastrService,
    private sqliteQueryService: SqliteQueryService,
    private electronService: ElectronService,
  ) {}

  ngOnInit(): void {
    this.mysqlService.connectionLost$
      .pipe(distinctUntilChanged())
      .subscribe((status) => {
        if (!status) {
          this.toastrService.error('Database connection lost');
        } else {
          this.toastrService.success('Database reconnected');
        }
      });

    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.sqliteQueryService.query<{ id: number, name: string}>(
        'SELECT * FROM achievements WHERE id = 970', true
      ).subscribe((result) => {
        this.sqliteResult = result ? result[0] : null;
      });
    }
  }
}
