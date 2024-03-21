import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { DTCFG } from '@keira/shared/config';
import { Option } from '@keira/shared/constants';
import { SingleValueModalConfig } from './single-value-selector.model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-single-value-selector-modal',
  templateUrl: './single-value-selector-modal.component.html',
  styleUrls: ['./single-value-selector-modal.component.scss'],
  standalone: true,
  imports: [NgxDatatableModule, TranslateModule],
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
