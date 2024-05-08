import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(modalService: BsModalService) {
    super(SoundEntriesSelectorModalComponent, modalService);
  }
}
