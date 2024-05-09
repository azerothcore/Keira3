import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-text-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class NpcTextSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = NpcTextSelectorModalComponent;
}
