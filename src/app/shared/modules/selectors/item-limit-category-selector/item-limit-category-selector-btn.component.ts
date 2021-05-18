import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  selector: 'keira-item-limit-category-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class ItemLimitCategorySelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(ItemLimitCategorySelectorModalComponent, modalService);
  }
}
