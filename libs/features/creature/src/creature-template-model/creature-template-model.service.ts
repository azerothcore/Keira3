import { Injectable, inject } from '@angular/core';
import {
  CREATURE_TEMPLATE_MODEL_ID,
  CREATURE_TEMPLATE_MODEL_ID_2,
  CREATURE_TEMPLATE_MODEL_TABLE,
  CreatureTemplateModel,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateModelService extends MultiRowEditorService<CreatureTemplateModel> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureTemplateModel;
  protected override readonly _entityTable = CREATURE_TEMPLATE_MODEL_TABLE;
  protected override readonly _entityIdField = CREATURE_TEMPLATE_MODEL_ID;
  protected override readonly _entitySecondIdField = CREATURE_TEMPLATE_MODEL_ID_2;

  constructor() {
    super();
  }
}
