import { Component, OnInit, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { FlagsService } from '../../../../../services/helpers/flags.service';

@Component({
  selector: 'app-flags-selector-modal',
  templateUrl: './flags-selector-modal.component.html',
  styleUrls: ['./flags-selector-modal.component.scss']
})
export class FlagsSelectorModalComponent extends BaseSelectorModalComponent implements OnInit {

  public readonly pow = Math.pow;

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
      this.flagValues = this.flagsService.getBitsArray(
        this.config.flags,
        parseInt(`${this.value}`, 10),
      );
    }
  }

  toggleBit(bit: number) {
    this.flagValues[bit] = !this.flagValues[bit];
    this.value = this.flagsService.getValueFromBits(this.flagValues);
  }
}
