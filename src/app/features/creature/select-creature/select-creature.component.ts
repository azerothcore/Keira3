import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import {
  CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira-types/creature-template.type';
import { SelectCreatureService } from './select-creature.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-select-creature',
  templateUrl: './select-creature.component.html',
  styleUrls: ['./select-creature.component.scss'],
})
export class SelectCreatureComponent extends SelectComponent<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectCreatureService,
    public handlerService: CreatureHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
