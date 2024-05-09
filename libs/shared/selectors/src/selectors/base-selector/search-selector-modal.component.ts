import { DTCFG } from '@keira/shared/config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { TableRow } from '@keira/shared/constants';
import { SearchService } from '@keira/shared/base-abstract-classes';

export abstract class SearchSelectorModalComponent<T extends TableRow> extends BaseSelectorModalComponent {
  readonly DTCFG = DTCFG;

  protected abstract entityIdField: string;
  protected abstract searchService: SearchService<T>;

  onSelect({ selected }: { selected: { value: string | number }[] }) {
    this.value = selected[0][this.entityIdField];
  }

  onSearch(): void {
    this.searchService.onSearch(this.changeDetectorRef);
  }
}
