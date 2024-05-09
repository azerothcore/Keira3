import { ChangeDetectorRef, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseModalConfig } from './base-selector.model';

export abstract class BaseSelectorModalComponent<ModalConfigType extends BaseModalConfig = BaseModalConfig> {
  // will be injected by the component that creates the modal
  public value: string | number;
  public config: ModalConfigType;

  public onValueSelected = new Subject<string | number>();

  protected readonly changeDetectorRef = inject(ChangeDetectorRef);
  protected readonly bsModalRef = inject(BsModalRef);

  onCancel() {
    this.bsModalRef.hide();
  }

  onSave() {
    this.onValueSelected.next(this.value);
    this.bsModalRef.hide();
  }
}
