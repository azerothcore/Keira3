import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MysqlError } from 'mysql';

import { MysqlService } from '../../services/mysql.service';

@Component({
  selector: 'app-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss']
})
export class ConnectionWindowComponent implements OnInit {

  form: FormGroup;
  error: MysqlError;

  constructor(
    private mysqlService: MysqlService,
  ) { }

  ngOnInit() {
    this.form = new FormGroup({
      'host': new FormControl('127.0.0.1'),
      'port': new FormControl('3306'),
      'user': new FormControl('root'),
      'password': new FormControl('root'),
      'database': new FormControl('acore_world'),
    });
  }

  onConnect() {
    this.mysqlService.connect(this.form.getRawValue()).subscribe(() => {
      this.error = null;
    }, (error) => {
      this.error = error;
    });
  }
}
