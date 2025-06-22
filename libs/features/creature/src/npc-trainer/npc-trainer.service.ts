import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TRAINER_ID, NPC_TRAINER_ID_2, NPC_TRAINER_TABLE, NpcTrainer } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(NpcTrainer, NPC_TRAINER_TABLE, NPC_TRAINER_ID, NPC_TRAINER_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}
