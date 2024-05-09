import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-holiday-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class HolidaySelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = HolidaySelectorModalComponent;
}
