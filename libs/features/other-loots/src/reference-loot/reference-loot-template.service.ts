import { Injectable, inject } from '@angular/core';
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
  protected override readonly handlerService = inject(ReferenceLootHandlerService);

  constructor() {
    super(ReferenceLootTemplate, REFERENCE_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2);
  }
}
