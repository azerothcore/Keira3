import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';

@Component({
  selector: 'app-flags-selector-modal',
  templateUrl: './flags-selector-modal.component.html',
  styleUrls: ['./flags-selector-modal.component.scss']
})
export class FlagsSelectorModalComponent extends BaseSelectorModalComponent {

  constructor(
    protected bsModalRef: BsModalRef,
  ) {
    super(bsModalRef);
  }
}
