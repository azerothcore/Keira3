import { Subject } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap';

export abstract class BaseSelectorModalComponent {

  // will be injected by the component that creates the modal
  public value: string|number;
  public config;

  public onValueSelected = new Subject<string|number>();

  constructor(
    protected bsModalRef: BsModalRef,
  ) {}

  onCancel() {
    this.bsModalRef.hide();
  }

  onSave() {
    this.onValueSelected.next(this.value);
    this.bsModalRef.hide();
  }
}
