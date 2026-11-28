import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SkillSelectorModalComponent } from './skill-selector-modal.component';

@Component({
  selector: 'keira-skill-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class SkillSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SkillSelectorModalComponent;
}
