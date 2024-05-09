import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
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
  public readonly handlerService = inject(GameobjectHandlerService);
  protected readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  protected readonly entityIdField = GAMEOBJECT_TEMPLATE_ID;
  protected readonly entityNameField = GAMEOBJECT_TEMPLATE_NAME;
  protected readonly fieldList = GAMEOBJECT_TEMPLATE_SEARCH_FIELDS;
}
