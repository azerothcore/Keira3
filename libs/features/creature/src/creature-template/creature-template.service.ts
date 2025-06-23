import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override _entityClass = CreatureTemplate;
  protected override _entityTable = CREATURE_TEMPLATE_TABLE;
  protected override _entityIdField = CREATURE_TEMPLATE_ID;
  protected override _entityNameField = CREATURE_TEMPLATE_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
  }
}
