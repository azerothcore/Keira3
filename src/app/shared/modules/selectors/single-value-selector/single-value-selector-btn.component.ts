import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SingleValueModalConfig } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.model';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-single-value-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class SingleValueSelectorBtnComponent extends BaseSelectorBtnComponent<SingleValueModalConfig> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(SingleValueSelectorModalComponent, modalService);
  }
}
