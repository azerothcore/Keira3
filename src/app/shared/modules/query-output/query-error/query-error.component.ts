import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QueryError } from 'mysql2';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss'],
})
export class QueryErrorComponent {
  @Input() error: QueryError;
}
