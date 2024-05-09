import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SoundEntriesSelectorModalComponent } from './sound-entries-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sound-entries-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class SoundEntriesSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SoundEntriesSelectorModalComponent;
}
