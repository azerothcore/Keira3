import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class GameobjectSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = GameobjectSelectorModalComponent;
}
