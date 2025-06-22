import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_SEARCH_FIELDS,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectGameobjectService extends SelectService<GameobjectTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(GameobjectHandlerService);
  protected override readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  protected override readonly entityIdField = GAMEOBJECT_TEMPLATE_ID;
  protected override entityNameField = GAMEOBJECT_TEMPLATE_NAME;
  protected override readonly fieldList = GAMEOBJECT_TEMPLATE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
