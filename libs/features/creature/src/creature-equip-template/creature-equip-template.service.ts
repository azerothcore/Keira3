import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_EQUIP_TEMPLATE_ID, CREATURE_EQUIP_TEMPLATE_TABLE, CreatureEquipTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureEquipTemplateService extends SingleRowEditorService<CreatureEquipTemplate> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override _entityClass = CreatureEquipTemplate;
  protected override _entityTable = CREATURE_EQUIP_TEMPLATE_TABLE;
  protected override _entityIdField = CREATURE_EQUIP_TEMPLATE_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
    this.init();
  }
}
