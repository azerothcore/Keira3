import { BsModalRef } from 'ngx-bootstrap/modal';

import { DTCFG } from '@keira-config/datatable.config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';

export abstract class SearchSelectorModalComponent extends BaseSelectorModalComponent {
  readonly DTCFG = DTCFG;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected entityIdField: string, protected bsModalRef: BsModalRef) {
    super(bsModalRef);
  }

  onSelect({ selected }) {
    this.value = selected[0][this.entityIdField];
  }
}
