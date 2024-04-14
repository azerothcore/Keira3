import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  LOOT_TEMPLATE_ID_2,
  REFERENCE_LOOT_TEMPLATE_TABLE,
  ReferenceLootTemplate,
} from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ReferenceLootTemplateService extends MultiRowEditorService<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: ReferenceLootHandlerService) {
    super(ReferenceLootTemplate, REFERENCE_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);
  }
}
