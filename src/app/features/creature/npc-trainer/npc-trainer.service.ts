import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../../../shared/abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '../../../shared/services/query.service';
import {
  NPC_TRAINER_ID,
  NPC_TRAINER_ID_2,
  NPC_TRAINER_TABLE,
  NpcTrainer,
} from '../../../shared/types/npc-trainer.type';

@Injectable({
  providedIn: 'root'
})
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      NpcTrainer,
      NPC_TRAINER_TABLE,
      NPC_TRAINER_ID,
      NPC_TRAINER_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
