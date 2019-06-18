import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';

import { DTCFG } from '../../../../../config/datatable.config';

export abstract class BaseSelectorModalComponent {
  public readonly DTCFG = DTCFG;

  public onValueSelected = new Subject<string|number>();
  public value: string|number; // will be injected by the component that creates the modal

  constructor(
    protected entityIdField: string,
    protected bsModalRef: BsModalRef,
  ) {}

  onCancel() {
    this.bsModalRef.hide();
  }

  onSelect({ selected }) {
    this.value = selected[0][this.entityIdField];
  }

  onSave() {
    this.onValueSelected.next(this.value);
    this.bsModalRef.hide();
  }
}
