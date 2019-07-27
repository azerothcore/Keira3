import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MysqlError } from 'mysql';
import { version } from '../../../../package.json';

import { MysqlService } from '../../services/mysql.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

@Component({
  selector: 'app-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss']
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {

  public readonly KEIRA_VERSION = version;
  form: FormGroup;
  error: MysqlError;

  constructor(
    private mysqlService: MysqlService,
  ) {
    super();
  }

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
    this.subscriptions.push(
      this.mysqlService.connect(this.form.getRawValue()).subscribe(() => {
        this.error = null;
      }, (error: MysqlError) => {
        this.error = error;
      })
  );
  }
}
