import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { FlagsService } from './flags.service';
import { FlagsModalConfig } from './flags-selector.model';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-flags-selector-modal',
  templateUrl: './flags-selector-modal.component.html',
  styleUrls: ['./flags-selector-modal.component.scss'],
})
export class FlagsSelectorModalComponent extends BaseSelectorModalComponent<FlagsModalConfig> implements OnInit {
  readonly pow = Math.pow;

  flagValues: boolean[];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(private flagsService: FlagsService, protected bsModalRef: BsModalRef) {
    super(bsModalRef);
  }

  ngOnInit() {
    if (this.config) {
      this.flagValues = this.flagsService.getBitsArray(this.config.flags, parseInt(`${this.value}`, 10));
    }
  }

  toggleBit(bit: number) {
    this.flagValues[bit] = !this.flagValues[bit];
    this.value = this.flagsService.getValueFromBits(this.flagValues);
  }
}
