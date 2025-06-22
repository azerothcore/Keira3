import { Injectable, inject } from '@angular/core';
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
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(CreatureHandlerService);
  protected readonly entityTable = CREATURE_TEMPLATE_TABLE;
  protected readonly entityIdField = CREATURE_TEMPLATE_ID;
  protected entityNameField = CREATURE_TEMPLATE_NAME;
  protected readonly fieldList = CREATURE_TEMPLATE_SEARCH_FIELDS;
  private readonly init = this.init();
}
