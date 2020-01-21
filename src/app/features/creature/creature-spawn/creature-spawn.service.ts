import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../../../shared/abstract/service/editors/multi-row-editor.service';
import { CreatureSpawn, CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, CREATURE_SPAWN_TABLE } from '../../../shared/types/creature-spawn.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '../../../shared/services/query.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureSpawnService extends MultiRowEditorService<CreatureSpawn> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureSpawn,
      CREATURE_SPAWN_TABLE,
      CREATURE_SPAWN_ID,
      CREATURE_SPAWN_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
