import { Component, OnInit } from '@angular/core';
import { MysqlService } from '../shared/services/mysql.service';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs/operators';

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
  }
}
