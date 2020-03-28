import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  selector: 'keira-holiday-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss']
})
export class HolidaySelectorBtnComponent extends BaseSelectorBtnComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    modalService: BsModalService,
  ) {
    super(
      HolidaySelectorModalComponent,
      modalService,
    );
  }
}
