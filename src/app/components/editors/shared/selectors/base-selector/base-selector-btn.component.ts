import { Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { Class } from '../../../../../types/general';

export abstract class BaseSelectorBtnComponent {

  @Input() control: FormControl;
  @Input() modalClass = 'modal-xl';

  private modalRef: BsModalRef;

  constructor(
    private modalComponentClass: Class, // should be a class (not an object) that extends BaseSelectorModalComponent
    protected modalService: BsModalService,
  ) { }

  onClick() {
    this.modalRef = this.modalService.show(
      this.modalComponentClass,
      Object.assign({}, { class: this.modalClass })
    );
    this.modalRef.content.value = this.control.value;
    this.modalRef.content.onValueSelected.subscribe((newValue) => {
      this.control.markAsDirty();
      this.control.setValue(newValue);
    });
  }
}
