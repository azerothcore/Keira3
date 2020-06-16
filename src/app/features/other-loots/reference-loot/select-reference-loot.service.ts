import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
} from '@keira-types/creature-template.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable()
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly queryService: MysqlQueryService,
    public handlerService: ReferenceLootHandlerService,
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
