import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { NPC_TRAINER_ID, NPC_TRAINER_ID_2, NPC_TRAINER_TABLE, NpcTrainer } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(NpcTrainer, NPC_TRAINER_TABLE, NPC_TRAINER_ID, NPC_TRAINER_ID_2, handlerService);
  }
}
