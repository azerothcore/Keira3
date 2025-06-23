import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_ADDON_ID, CREATURE_TEMPLATE_ADDON_TABLE, CreatureTemplateAddon } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateAddonService extends SingleRowEditorService<CreatureTemplateAddon> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override _entityClass = CreatureTemplateAddon;
  protected override _entityTable = CREATURE_TEMPLATE_ADDON_TABLE;
  protected override _entityIdField = CREATURE_TEMPLATE_ADDON_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
  }
}
