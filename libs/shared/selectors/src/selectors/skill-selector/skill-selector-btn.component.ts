import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skill-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
  imports: [NgIf],
})
export class SkillSelectorBtnComponent extends BaseSelectorBtnComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(SkillSelectorModalComponent, modalService);
  }
}
