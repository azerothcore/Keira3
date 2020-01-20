import { Component } from '@angular/core';
import { MysqlService } from '../shared/services/mysql.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public mysqlService: MysqlService) {}
}
