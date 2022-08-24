import { Component, Input } from '@angular/core';
import { QueryError as MysqlError } from 'mysql2';

@Component({
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss'],
})
export class QueryErrorComponent {
  @Input() error: MysqlError;
}
