import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { MapSelectorModalComponent } from './map-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class MapSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = MapSelectorModalComponent;
}
