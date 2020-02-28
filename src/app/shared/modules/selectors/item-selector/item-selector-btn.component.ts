import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  selector: 'app-item-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss']
})
export class ItemSelectorBtnComponent extends BaseSelectorBtnComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    modalService: BsModalService,
  ) {
    super(
      ItemSelectorModalComponent,
      modalService,
    );
  }
}
