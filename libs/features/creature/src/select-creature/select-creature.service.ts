import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME,
  CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectCreatureService extends SelectService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    override readonly queryService: MysqlQueryService,
    public override readonly handlerService: CreatureHandlerService,
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
