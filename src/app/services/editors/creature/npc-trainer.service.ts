import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  NPC_TRAINER_ID,
  NPC_TRAINER_ID_2,
  NPC_TRAINER_TABLE,
  NpcTrainer,
} from '../../../components/editors/creature/npc-trainer/npc-trainer.type';

@Injectable({
  providedIn: 'root'
})
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      NpcTrainer,
      NPC_TRAINER_TABLE,
      NPC_TRAINER_ID,
      NPC_TRAINER_ID_2,
      handlerService,
      queryService,
    );
  }
}
