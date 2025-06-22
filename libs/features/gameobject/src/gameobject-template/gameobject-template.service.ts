import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { FieldDefinition, GO_DATA_FIELDS } from '@keira/shared/constants';
import {
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_NAME,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectTemplateService extends SingleRowEditorService<GameobjectTemplate> {
  protected override readonly handlerService: GameobjectHandlerService;

  constructor() {
    const handlerService = inject(GameobjectHandlerService);

    super(GameobjectTemplate, GAMEOBJECT_TEMPLATE_TABLE, GAMEOBJECT_TEMPLATE_ID, GAMEOBJECT_TEMPLATE_NAME, true, handlerService);

    this.handlerService = handlerService;
  }

  getFieldDefinition(type: number, dataIndex: number): FieldDefinition {
    return GO_DATA_FIELDS[type] && GO_DATA_FIELDS[type][dataIndex]
      ? GO_DATA_FIELDS[type][dataIndex]
      : { name: `Data${dataIndex}`, tooltip: 'EMPTY' };
  }
}
