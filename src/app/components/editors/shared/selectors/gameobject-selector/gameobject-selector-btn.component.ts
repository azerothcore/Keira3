import { Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  selector: 'app-gameobject-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss']
})
export class GameobjectSelectorBtnComponent extends BaseSelectorBtnComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    modalService: BsModalService,
  ) {
    super(
      GameobjectSelectorModalComponent,
      modalService,
    );
  }
}
