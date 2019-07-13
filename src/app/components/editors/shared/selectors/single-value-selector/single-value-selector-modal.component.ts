import { Component, OnInit, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { DTCFG } from '../../../../../config/datatable.config';
import { Option } from '../../../../../types/general';

@Component({
  selector: 'app-single-value-selector-modal',
  templateUrl: './single-value-selector-modal.component.html',
  styleUrls: ['./single-value-selector-modal.component.scss']
})
export class SingleValueSelectorModalComponent extends BaseSelectorModalComponent implements OnInit {

  public readonly DTCFG = DTCFG;
  selected: Option[] = [];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
  ) {
    super(bsModalRef);
  }

  ngOnInit() {
    if (this.config) {
      for (const option of this.config.options) {
        if (`${option.value}` === `${this.value}`) {
          this.selected = [option];
          break;
        }
      }
    }
  }

  onSelect({ selected }) {
    this.value = selected[0].value;
  }
}
