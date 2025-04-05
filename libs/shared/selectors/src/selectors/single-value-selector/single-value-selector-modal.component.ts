import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { DTCFG } from '@keira/shared/config';
import { Option } from '@keira/shared/constants';
import { SingleValueModalConfig } from './single-value-selector.model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-single-value-selector-modal',
  templateUrl: './single-value-selector-modal.component.html',
  styleUrls: ['./single-value-selector-modal.component.scss'],
  imports: [NgxDatatableModule, TranslateModule],
})
export class SingleValueSelectorModalComponent extends BaseSelectorModalComponent<SingleValueModalConfig> implements OnInit {
  readonly DTCFG = DTCFG;
  selected: Option[] = [];

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

  onSelect({ selected }: { selected: { value: string | number }[] }) {
    this.value = selected[0].value;
  }
}
