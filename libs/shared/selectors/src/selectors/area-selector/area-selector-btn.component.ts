import { Component } from '@angular/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { AreaSelectorModalComponent } from './area-selector-modal.component';

@Component({
  selector: 'keira-area-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class AreaSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = AreaSelectorModalComponent;
}
