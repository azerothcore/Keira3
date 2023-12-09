import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComplexKeyComponent } from '@keira-abstract/components/editors/select-complex-key.component';
import { ConditionsSearchService } from '@keira-shared/modules/search/conditions-search.service';
import { Conditions, CONDITION_SOURCE_TYPES, CONDITION_SOURCE_TYPES_KEYS } from '@keira-types/conditions.type';
import { ConditionsHandlerService } from '../conditions-handler.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-select-creature',
  templateUrl: './select-conditions.component.html',
  styleUrls: ['./select-conditions.component.scss'],
})
export class SelectConditionsComponent extends SelectComplexKeyComponent<Conditions> {
  readonly CONDITION_SOURCE_TYPES = CONDITION_SOURCE_TYPES;
  readonly CONDITION_SOURCE_TYPES_KEYS = CONDITION_SOURCE_TYPES_KEYS;

  constructor(public selectService: ConditionsSearchService, protected handlerService: ConditionsHandlerService) {
    super(selectService, handlerService);
  }
}
