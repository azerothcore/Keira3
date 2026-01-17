import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-holiday-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class HolidaySelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = HolidaySelectorModalComponent;
}
