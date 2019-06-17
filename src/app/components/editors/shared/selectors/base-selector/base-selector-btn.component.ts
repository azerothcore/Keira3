import { Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { Class } from '../../../../../types';

export abstract class BaseSelectorBtnComponent {

  @Input() control: FormControl;

  private modalRef: BsModalRef;

  constructor(
    private modalComponentClass: Class, // should be a class (not an object) that extends BaseSelectorModalComponent
    protected modalService: BsModalService,
  ) { }

  onSelect() {
    this.modalRef = this.modalService.show(this.modalComponentClass);
    this.modalRef.content.value = this.control.value;
    this.modalRef.content.onValueSelected.subscribe((newValue) => {
      this.control.setValue(newValue);
    });
  }
}
