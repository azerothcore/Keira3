import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QueryError } from 'mysql2';
import { NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class QueryErrorComponent {
  @Input() error: QueryError;
}
