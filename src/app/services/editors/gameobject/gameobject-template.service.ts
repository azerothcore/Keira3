import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
  gameobjectTypeData,
} from '../../../types/gameobject-template.type';
import { QueryService } from '../../query.service';
import { GameobjectHandlerService } from '../../handlers/gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectTemplateService extends SingleRowEditorService<GameobjectTemplate> {

  public gameobjectTypeData = gameobjectTypeData;

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

  getFieldDefinition(type: number, dataIndex: number): { name: string, tooltip: string } {
    return this.gameobjectTypeData[type] && this.gameobjectTypeData[type][dataIndex]
    ? this.gameobjectTypeData[type][dataIndex]
    : {name: 'Data' + dataIndex, tooltip: '' };
  }

}

