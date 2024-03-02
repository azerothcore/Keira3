import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import {
  CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira/acore-world-model';
import { SelectCreatureService } from './select-creature.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
