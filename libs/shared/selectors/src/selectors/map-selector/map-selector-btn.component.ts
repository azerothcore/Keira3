import { ChangeDetectionStrategy, Component } from '@angular/core';

import { MapSelectorModalComponent } from './map-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class MapSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = MapSelectorModalComponent;
}
