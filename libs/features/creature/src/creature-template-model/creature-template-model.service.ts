import { Injectable } from '@angular/core';
import { CREATURE_TEMPLATE_MODEL_ID_2, CREATURE_TEMPLATE_MODEL_TABLE, CreatureTemplateModel } from '@keira/shared/acore-world-model';
import { MultiRowExternalEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateModelService extends MultiRowExternalEditorService<CreatureTemplateModel> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(CreatureTemplateModel, CREATURE_TEMPLATE_MODEL_TABLE, CREATURE_TEMPLATE_MODEL_ID_2, handlerService);
  }

  selectQuery(entry: string | number) {
    return this.queryService.query<CreatureTemplateModel>(
      `SELECT ctm.* FROM creature_template AS ct INNER JOIN creature_template_model AS ctm ON ct.entry = ctm.CreatureID WHERE ct.entry = ${entry}`,
    );
  }
}
