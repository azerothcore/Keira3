import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_MOVEMENT_ID, CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureTemplateMovement, CREATURE_TEMPLATE_MOVEMENT_TABLE, CREATURE_TEMPLATE_MOVEMENT_ID, null, false, handlerService);

    this.handlerService = handlerService;
  }
}
