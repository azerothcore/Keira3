import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(CreatureTemplateModel, CREATURE_TEMPLATE_MODEL_TABLE, CREATURE_TEMPLATE_MODEL_ID, CREATURE_TEMPLATE_MODEL_ID_2, handlerService);
  }
}
