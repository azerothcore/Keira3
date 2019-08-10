import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate
} from '../../../types/gameobject-template.type';
import { QueryService } from '../../query.service';
import { GameobjectHandlerService } from '../../handlers/gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectTemplateService extends SingleRowEditorService<GameobjectTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectTemplate,
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
    );
  }
}