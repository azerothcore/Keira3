import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FlagsModalConfig } from './flags-selector.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-flags-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class FlagsSelectorBtnComponent extends BaseSelectorBtnComponent<FlagsModalConfig> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(FlagsSelectorModalComponent, modalService);
  }
}
