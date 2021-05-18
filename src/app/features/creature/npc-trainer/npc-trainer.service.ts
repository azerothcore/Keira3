import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { NPC_TRAINER_ID, NPC_TRAINER_ID_2, NPC_TRAINER_TABLE, NpcTrainer } from '@keira-types/npc-trainer.type';

@Injectable()
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(NpcTrainer, NPC_TRAINER_TABLE, NPC_TRAINER_ID, NPC_TRAINER_ID_2, handlerService, queryService, toastrService);
  }
}
