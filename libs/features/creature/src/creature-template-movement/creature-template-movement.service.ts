import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_MOVEMENT_ID, CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  constructor() {
    super(CreatureTemplateMovement, CREATURE_TEMPLATE_MOVEMENT_TABLE, CREATURE_TEMPLATE_MOVEMENT_ID, null, false);
  }
}
