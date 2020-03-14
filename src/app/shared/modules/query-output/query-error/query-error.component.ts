import { Component, Input } from '@angular/core';
import { MysqlError } from 'mysql';

@Component({
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss']
})
export class QueryErrorComponent {
  @Input() error: MysqlError;
}
