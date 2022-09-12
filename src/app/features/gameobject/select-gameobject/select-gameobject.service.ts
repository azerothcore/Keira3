import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  GameobjectTemplate,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_SEARCH_FIELDS,
  GAMEOBJECT_TEMPLATE_TABLE,
} from '@keira-types/gameobject-template.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class SelectGameobjectService extends SelectService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService, public handlerService: GameobjectHandlerService) {
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
