import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_ADDON_ID, CREATURE_TEMPLATE_ADDON_TABLE, CreatureTemplateAddon } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateAddonService extends SingleRowEditorService<CreatureTemplateAddon> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureTemplateAddon, CREATURE_TEMPLATE_ADDON_TABLE, CREATURE_TEMPLATE_ADDON_ID, null, false, handlerService);

    this.handlerService = handlerService;
  }
}
