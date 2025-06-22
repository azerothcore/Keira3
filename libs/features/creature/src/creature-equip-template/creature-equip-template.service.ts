import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_EQUIP_TEMPLATE_ID, CREATURE_EQUIP_TEMPLATE_TABLE, CreatureEquipTemplate } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureEquipTemplateService extends SingleRowEditorService<CreatureEquipTemplate> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureEquipTemplate, CREATURE_EQUIP_TEMPLATE_TABLE, CREATURE_EQUIP_TEMPLATE_ID, null, false, handlerService);

    this.handlerService = handlerService;
  }
}
