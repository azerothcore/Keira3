import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { CreatureSelectorModalComponent } from './creature-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class CreatureSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = CreatureSelectorModalComponent;
}
