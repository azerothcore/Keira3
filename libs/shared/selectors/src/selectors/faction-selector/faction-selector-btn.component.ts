import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FactionSelectorModalComponent } from './faction-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-faction-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class FactionSelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(FactionSelectorModalComponent, modalService);
  }
}
