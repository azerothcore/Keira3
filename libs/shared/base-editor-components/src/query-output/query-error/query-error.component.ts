import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QueryError } from 'mysql2';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-query-error',
  templateUrl: './query-error.component.html',
  styleUrls: ['./query-error.component.scss'],
  imports: [TranslateModule],
})
export class QueryErrorComponent {
  @Input() error: QueryError | undefined;
  showTrace = false;
}
