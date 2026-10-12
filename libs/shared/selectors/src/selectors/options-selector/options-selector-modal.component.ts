import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TranslateDirective } from '@ngx-translate/core';
import { UiSwitchModule } from 'ngx-ui-switch';

import { Option } from '@keira/shared/constants';
import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { OptionsModalConfig } from './options-selector.model';
import { OptionsSelectorService } from './options-selector.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-options-selector-modal',
  templateUrl: './options-selector-modal.component.html',
  styleUrls: ['./options-selector-modal.component.scss'],
  imports: [UiSwitchModule, TranslateDirective],
})
export class OptionsSelectorModalComponent extends BaseSelectorModalComponent<OptionsModalConfig> implements OnInit {
  private readonly optionsSelectorService = inject(OptionsSelectorService);

  selectedValues: number[] = [];

  ngOnInit(): void {
    if (this.config) {
      this.selectedValues = this.optionsSelectorService.getValuesFromCsv(this.value);
    }
  }

  isSelected(value: Option['value']): boolean {
    return this.selectedValues.includes(Number(value));
  }

  toggleOption(value: Option['value']): void {
    const id = Number(value);
    this.selectedValues = this.isSelected(value) ? this.selectedValues.filter((selected) => selected !== id) : [...this.selectedValues, id];
    this.value = this.optionsSelectorService.getCsvFromValues(this.selectedValues);
  }
}
