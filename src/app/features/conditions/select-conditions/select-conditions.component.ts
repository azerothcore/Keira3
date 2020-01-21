import { Component, } from '@angular/core';

import { ConditionsSearchService } from '@keira-shared/modules/search/conditions-search.service';
import { CONDITION_SOURCE_TYPES, CONDITION_SOURCE_TYPES_KEYS, Conditions } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';
import { SelectComplexKeyComponent } from '@keira-abstract/components/editors/select-complex-key.component';

@Component({
  selector: 'app-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss']
})
export class SelectConditionsComponent extends SelectComplexKeyComponent<Conditions> {
  public readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  public readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;

  constructor(
    public selectService: ConditionsSearchService,
    protected handlerService: ConditionsHandlerService,
  ) {
    super(selectService, handlerService);
  }
}
