import { Input, Directive } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

import { Class } from '@keira-types/general';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';
import { BaseModalConfig } from './base-selector.model';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class BaseSelectorBtnComponent<ModalConfigType extends BaseModalConfig = BaseModalConfig> extends SubscriptionHandler {
  @Input({ required: true }) control: AbstractControl;
  @Input() config: ModalConfigType;
  @Input() modalClass = 'modal-xl';
  @Input({ required: true }) disabled: boolean;

  private modalRef: BsModalRef;

  constructor(
    private modalComponentClass: Class, // should be a class (not an object) that extends BaseSelectorModalComponent
    protected modalService: BsModalService,
  ) {
    super();
  }

  onClick() {
    this.modalRef = this.modalService.show(this.modalComponentClass, {
      class: this.modalClass,
      initialState: {
        config: this.config,
        value: this.control.value,
      },
    });

    this.subscriptions.push(
      this.modalRef.content.onValueSelected.subscribe((newValue) => {
        this.control.markAsDirty();
        this.control.setValue(newValue);
      }),
    );
  }
}
