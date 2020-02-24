import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs/operators';
import * as sqlite from 'sqlite3';

import { MysqlService } from '../shared/services/mysql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  constructor(
    public mysqlService: MysqlService,
    public toastrService: ToastrService,
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


    const myDb = new sqlite.Database(':memory:');
  }
}
