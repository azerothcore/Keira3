import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira-types/gameobject-template.type';
import { FieldDefinition } from '@keira-types/general';
import { GO_DATA_FIELDS } from '@keira-constants/gameobject-types';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class GameobjectTemplateService extends SingleRowEditorService<GameobjectTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectTemplate,
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }

  getFieldDefinition(type: number, dataIndex: number): FieldDefinition {
    return GO_DATA_FIELDS[type] && GO_DATA_FIELDS[type][dataIndex]
    ? GO_DATA_FIELDS[type][dataIndex]
    : { name: `Data${dataIndex}`, tooltip: null };
  }

}

