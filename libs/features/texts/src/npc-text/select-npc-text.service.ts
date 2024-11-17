import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { NPC_TEXT_ID, NPC_TEXT_SEARCH_FIELDS, NPC_TEXT_TABLE, NpcText } from '@keira/shared/acore-world-model';
import { NpcTextHandlerService } from './npc-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectNpcTextService extends SelectService<NpcText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    override readonly queryService: MysqlQueryService,
    public override readonly handlerService: NpcTextHandlerService,
  ) {
    super(queryService, handlerService, NPC_TEXT_TABLE, NPC_TEXT_ID, null, NPC_TEXT_SEARCH_FIELDS);
  }
}
