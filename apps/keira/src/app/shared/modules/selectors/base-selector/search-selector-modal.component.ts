import { BsModalRef } from 'ngx-bootstrap/modal';

import { DTCFG } from '@keira/config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';
import { TableRow } from '@keira/shared-constants';
import { SearchService } from '@keira-shared/modules/search/search.service';

export abstract class SearchSelectorModalComponent<T extends TableRow> extends BaseSelectorModalComponent {
  readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected entityIdField: string,
    protected bsModalRef: BsModalRef,
    protected searchService: SearchService<T>,
  ) {
    super(bsModalRef);
  }

  onSelect({ selected }) {
    this.value = selected[0][this.entityIdField];
  }

  onSearch(): void {
    this.searchService.onSearch(this.changeDetectorRef);
  }
}
