import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-limit-category-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class ItemLimitCategorySelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(ItemLimitCategorySelectorModalComponent, modalService);
  }
}
