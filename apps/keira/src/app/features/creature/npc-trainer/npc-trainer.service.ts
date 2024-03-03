import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/core';
import { NPC_TRAINER_ID, NPC_TRAINER_ID_2, NPC_TRAINER_TABLE, NpcTrainer } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class NpcTrainerService extends MultiRowEditorService<NpcTrainer> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(NpcTrainer, NPC_TRAINER_TABLE, NPC_TRAINER_ID, NPC_TRAINER_ID_2, handlerService, queryService, toastrService);
  }
}
