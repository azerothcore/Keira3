import { ChangeDetectionStrategy, Component } from '@angular/core';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class CreatureSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = CreatureSelectorModalComponent;
}
