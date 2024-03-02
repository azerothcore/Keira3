import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira-abstract/components/editors/select-complex-key.component';
import { ConditionsSearchService } from '@keira-shared/modules/search/conditions-search.service';
import { Conditions, CONDITION_SOURCE_TYPES } from '@keira/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { getEnumKeys } from '@keira-shared/utils/helpers';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss'],
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
