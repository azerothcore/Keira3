import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { ItemDisplaySelectorModalComponent } from './item-display-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-display-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  imports: [],
})
export class ItemDisplaySelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = ItemDisplaySelectorModalComponent;
}
