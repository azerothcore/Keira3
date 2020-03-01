import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '@keira-types/creature-template.type';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class SelectCreatureService extends SelectService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: MysqlQueryService,
    public handlerService: CreatureHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_NAME,
      CREATURE_TEMPLATE_SEARCH_FIELDS,
    );
  }
}
