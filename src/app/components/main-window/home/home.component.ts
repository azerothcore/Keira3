import { Component, OnInit } from '@angular/core';

import { MysqlService } from '../../../services/mysql.service';
import { ElectronService } from '../../../services/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }
}
