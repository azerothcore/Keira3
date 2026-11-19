import { inject, Service } from '@angular/core';
import {
  AREATRIGGER_TELEPORT_ID,
  AREATRIGGER_TELEPORT_NAME,
  AREATRIGGER_TELEPORT_SEARCH_FIELDS,
  AREATRIGGER_TELEPORT_TABLE,
  AreatriggerTeleport,
} from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

/** The teleporting area triggers, with whether each also has a rest area, a quest objective or a script. */
@Service()
export class SelectAreaTriggerService extends SelectService<AreatriggerTeleport> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override readonly entityTable = AREATRIGGER_TELEPORT_TABLE;
  protected override readonly entityIdField = AREATRIGGER_TELEPORT_ID;
  protected override entityNameField = AREATRIGGER_TELEPORT_NAME;
  protected override readonly fieldList = AREATRIGGER_TELEPORT_SEARCH_FIELDS as (keyof AreatriggerTeleport & string)[];
  protected override readonly selectFields = [
    '*',
    '(SELECT `ScriptName` FROM `areatrigger_scripts` `s` WHERE `s`.`entry` = `areatrigger_teleport`.`ID`) AS `script`',
    '(SELECT `quest` FROM `areatrigger_involvedrelation` `q` WHERE `q`.`id` = `areatrigger_teleport`.`ID`) AS `quest`',
  ];
  protected override readonly orderFields = [AREATRIGGER_TELEPORT_ID];

  constructor() {
    super();
    this.init();
  }
}
