import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';

@Component({
  selector: 'app-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  styleUrls: ['./item-selector-modal.component.scss']
})
export class ItemSelectorModalComponent extends BaseSelectorModalComponent {

  constructor(
    protected bsModalRef: BsModalRef,
  ) {
    super(bsModalRef);
  }
}
