import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  selector: 'keira-quest-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class QuestSelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(QuestSelectorModalComponent, modalService);
  }
}
