import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-skill-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class SkillSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SkillSelectorModalComponent;
}
