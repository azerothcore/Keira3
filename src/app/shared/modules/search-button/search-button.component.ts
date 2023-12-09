import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { TableRow } from '@keira-types/general';
import { SearchService } from '@keira-shared/modules/search/search.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-search-button',
  templateUrl: './search-button.component.html',
})
export class SearchButtonComponent<T extends TableRow> {
  @Input() searchService: SearchService<T>;
}
