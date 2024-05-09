import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SpellSelectorModalComponent } from './spell-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class SpellSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SpellSelectorModalComponent;
}
