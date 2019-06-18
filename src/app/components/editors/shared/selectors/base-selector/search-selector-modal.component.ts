import { BsModalRef } from 'ngx-bootstrap';

import { DTCFG } from '../../../../../config/datatable.config';
import { BaseSelectorModalComponent } from './base-selector-modal.component';

export abstract class SearchSelectorModalComponent extends BaseSelectorModalComponent {
  public readonly DTCFG = DTCFG;

  constructor(
    protected entityIdField: string,
    protected bsModalRef: BsModalRef,
  ) {
    super(bsModalRef);
  }

  onSelect({ selected }) {
    this.value = selected[0][this.entityIdField];
  }
}
