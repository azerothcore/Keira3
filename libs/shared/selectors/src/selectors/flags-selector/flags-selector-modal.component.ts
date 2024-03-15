import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { FlagsService } from './flags.service';
import { FlagsModalConfig } from './flags-selector.model';
import { TranslateModule } from '@ngx-translate/core';
import { UiSwitchModule } from 'ngx-ui-switch';
import { NgIf, NgFor } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-flags-selector-modal',
  templateUrl: './flags-selector-modal.component.html',
  styleUrls: ['./flags-selector-modal.component.scss'],
  standalone: true,
  imports: [NgIf, NgFor, UiSwitchModule, TranslateModule],
})
export class FlagsSelectorModalComponent extends BaseSelectorModalComponent<FlagsModalConfig> implements OnInit {
  readonly pow = Math.pow;

  flagValues: boolean[];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    private flagsService: FlagsService,
    protected bsModalRef: BsModalRef,
  ) {
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
