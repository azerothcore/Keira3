import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs/operators';

import { MysqlService } from '../shared/services/mysql.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    public mysqlService: MysqlService,
    public toastrService: ToastrService,
    public sqliteQueryService: SqliteQueryService,
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
    this.sqliteQueryService.query('SELECT * FROM achievements WHERE id = 42').subscribe((result) => {

    });
  }
}
