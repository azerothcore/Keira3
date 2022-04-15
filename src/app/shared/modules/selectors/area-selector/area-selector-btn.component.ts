import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { AreaSelectorModalComponent } from './area-selector-modal.component';

@Component({
  selector: 'keira-area-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class AreaSelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(AreaSelectorModalComponent, modalService);
  }
}
