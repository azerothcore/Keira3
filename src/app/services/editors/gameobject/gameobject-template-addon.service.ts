import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ADDON_ID,
  GAMEOBJECT_TEMPLATE_ADDON_TABLE,
  GameobjectTemplateAddon,
} from '../../../types/gameobject-template-addon.type';
import { QueryService } from '../../query.service';
import { GameobjectHandlerService } from '../../handlers/gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectTemplateAddon,
      GAMEOBJECT_TEMPLATE_ADDON_TABLE,
      GAMEOBJECT_TEMPLATE_ADDON_ID,
      null,
      true,
      handlerService,
      queryService,
    );
  }

}

