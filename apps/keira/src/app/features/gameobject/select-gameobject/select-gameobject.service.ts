import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/shared/core';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_SEARCH_FIELDS,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class SelectGameobjectService extends SelectService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_NAME,
      GAMEOBJECT_TEMPLATE_SEARCH_FIELDS,
    );
  }
}
