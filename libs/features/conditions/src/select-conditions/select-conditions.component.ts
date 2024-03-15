import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira/shared/base-abstract-classes';
import { CONDITION_SOURCE_TYPES, Conditions } from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConditionsSearchService } from '@keira/shared/selectors';
import { getEnumKeys } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, NgFor, HighlightjsWrapperComponent, NgIf, NgxDatatableModule],
})
export class SelectConditionsComponent extends SelectComplexKeyComponent<Conditions> {
  readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  readonly CONDITION_SOURCE_TYPES_KEYS = getEnumKeys(CONDITION_SOURCE_TYPES);

  constructor(
    public selectService: ConditionsSearchService,
    protected handlerService: ConditionsHandlerService,
  ) {
    super(selectService, handlerService);
  }
}
