import { Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';

import { Class } from '../../../../../types/general';
import { SubscriptionHandler } from '../../../../../utils/subscription-handler/subscription-handler';

export abstract class BaseSelectorBtnComponent extends SubscriptionHandler {

  @Input() control: AbstractControl;
  @Input() config;
  @Input() modalClass = 'modal-xl';

  private modalRef: BsModalRef;

  constructor(
    private modalComponentClass: Class, // should be a class (not an object) that extends BaseSelectorModalComponent
    protected modalService: BsModalService,
  ) {
    super();
  }

  onClick() {
    this.modalRef = this.modalService.show(
      this.modalComponentClass,
      {
        class: this.modalClass,
        initialState: {
          config: this.config,
          value: this.control.value,
        }
      },
    );

    this.subscriptions.push(
      this.modalRef.content.onValueSelected.subscribe((newValue) => {
        this.control.markAsDirty();
        this.control.setValue(newValue);
      })
    );
  }
}
