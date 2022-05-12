import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureSpawn, CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, CREATURE_SPAWN_TABLE } from '@keira-types/creature-spawn.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class CreatureSpawnService extends MultiRowEditorService<CreatureSpawn> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureSpawn,
      CREATURE_SPAWN_TABLE,
      CREATURE_SPAWN_ID,
      CREATURE_SPAWN_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}
