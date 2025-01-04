import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GameTeleSelectorModalComponent } from './game-tele-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class GameTeleSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = GameTeleSelectorModalComponent;
}
