import { Component, Input } from '@angular/core';
import { QueryError } from 'mysql2';

@Component({
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss'],
})
export class QueryErrorComponent {
  @Input() error: QueryError;
}
