import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_TEMPLATE_MOVEMENT_ID, CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override _entityClass = CreatureTemplateMovement;
  protected override _entityTable = CREATURE_TEMPLATE_MOVEMENT_TABLE;
  protected override _entityIdField = CREATURE_TEMPLATE_MOVEMENT_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
  }
}
