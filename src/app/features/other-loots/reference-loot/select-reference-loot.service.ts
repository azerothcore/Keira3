import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';

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
      REFERENCE_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      null,
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
    );
  }
}
