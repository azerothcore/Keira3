import { OnInit } from '@angular/core';
import { DTCFG } from '@keira/shared/config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { TableRow } from '@keira/shared/constants';
import { SearchService } from '@keira/shared/base-abstract-classes';

export abstract class SearchSelectorModalComponent<T extends TableRow> extends BaseSelectorModalComponent implements OnInit {
  readonly DTCFG = DTCFG;

  protected abstract entityIdField: string;
  protected abstract searchService: SearchService<T>;

  /** Opened on a field already set: what it holds is shown. */
  ngOnInit(): void {
    if (this.value) {
      this.searchService.searchExact(this.entityIdField, this.value, this.changeDetectorRef);
    }
  }

  onSelect({ selected }: { selected: { [key: string]: string | number }[] }) {
    this.value = selected[0][this.entityIdField];
  }

  onSearch(): void {
    this.searchService.onSearch(this.changeDetectorRef);
  }
}
