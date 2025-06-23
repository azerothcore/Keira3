import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TRAINER_ID, NPC_TRAINER_ID_2, NPC_TRAINER_TABLE, NpcTrainer } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = NpcTrainer;
  protected override readonly _entityTable = NPC_TRAINER_TABLE;
  protected override readonly _entityIdField = NPC_TRAINER_ID;
  protected override readonly _entitySecondIdField = NPC_TRAINER_ID_2;

  constructor() {
    super();
    this.init();
  }
}
