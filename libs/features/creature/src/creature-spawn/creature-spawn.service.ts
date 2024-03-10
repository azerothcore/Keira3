import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import { CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, CREATURE_SPAWN_TABLE, CreatureSpawn } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureSpawnService extends MultiRowEditorService<CreatureSpawn> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(CreatureSpawn, CREATURE_SPAWN_TABLE, CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, handlerService, queryService, toastrService);
  }
}
