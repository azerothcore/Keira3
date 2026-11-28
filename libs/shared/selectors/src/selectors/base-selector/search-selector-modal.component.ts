import { Directive, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { DTCFG } from '@keira/shared/config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { TableRow } from '@keira/shared/constants';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Directive()
export abstract class SearchSelectorModalComponent<T extends TableRow> extends BaseSelectorModalComponent implements OnInit {
  readonly DTCFG = DTCFG;

  protected abstract entityIdField: string;
  protected abstract searchService: SearchService<T>;

  ngOnInit(): void {
    // 0 means no value, a negative one (e.g. a GUID in entryorguid) is never an id
    if (Number(this.value) > 0) {
      this.searchService.fields.reset();
      (this.searchService.fields.get(this.entityIdField) as AbstractControl).setValue(this.value);
      this.onSearch();
    }
  }

  onSelect({ selected }: { selected: { [key: string]: string | number }[] }) {
    this.value = selected[0][this.entityIdField];
  }

  onSearch(): void {
    this.searchService.onSearch(this.changeDetectorRef);
  }
}
