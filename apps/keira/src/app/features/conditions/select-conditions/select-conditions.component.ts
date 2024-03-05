import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ConditionsSearchService, getEnumKeys, SelectComplexKeyComponent } from '@keira/shared/core';
import { CONDITION_SOURCE_TYPES, Conditions } from '@keira/shared/acore-world-model';
import { ConditionsHandlerService } from '../conditions-handler.service';

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
