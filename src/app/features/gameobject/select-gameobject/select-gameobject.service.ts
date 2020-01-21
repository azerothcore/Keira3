import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME, GAMEOBJECT_TEMPLATE_SEARCH_FIELDS,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate
} from '@keira-types/gameobject-template.type';
import { QueryService } from '@keira-shared/services/query.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SelectGameobjectService extends SelectService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
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
