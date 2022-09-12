import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { DTCFG } from '@keira-config/datatable.config';
import { Option } from '@keira-types/general';
import { SingleValueModalConfig } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.model';

@Component({
  selector: 'keira-single-value-selector-modal',
  templateUrl: './single-value-selector-modal.component.html',
  styleUrls: ['./single-value-selector-modal.component.scss'],
})
export class SingleValueSelectorModalComponent extends BaseSelectorModalComponent<SingleValueModalConfig> implements OnInit {
  readonly DTCFG = DTCFG;
  selected: Option[] = [];

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef) {
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
