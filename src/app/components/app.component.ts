import { Component } from '@angular/core';
import { MysqlService } from '../services/mysql.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(public mysqlService: MysqlService, private translate: TranslateService) {
    translate.setDefaultLang(navigator.language);
  }
}
