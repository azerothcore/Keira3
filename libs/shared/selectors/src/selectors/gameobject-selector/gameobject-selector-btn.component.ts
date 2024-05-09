import { ChangeDetectionStrategy, Component } from '@angular/core';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class GameobjectSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = GameobjectSelectorModalComponent;
}
