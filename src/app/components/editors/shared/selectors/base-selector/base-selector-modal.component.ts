import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';

export abstract class BaseSelectorModalComponent {
  public onValueSelected = new Subject<string|number>();
  public value: string|number; // will be injected by the component that creates the modal

  constructor(
    protected bsModalRef: BsModalRef,
  ) {}

  onCancel() {
    this.bsModalRef.hide();
  }

  onSelection() {
    this.onValueSelected.next(this.value);
    this.bsModalRef.hide();
  }
}
