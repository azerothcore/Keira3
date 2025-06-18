import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { ItemSelectorModalComponent } from './item-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  imports: [],
})
export class ItemSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = ItemSelectorModalComponent;
}
