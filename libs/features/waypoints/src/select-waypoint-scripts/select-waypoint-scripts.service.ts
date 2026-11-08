import { inject, Service } from '@angular/core';
import {
  WAYPOINT_SCRIPTS_ID,
  WAYPOINT_SCRIPTS_SEARCH_FIELDS,
  WAYPOINT_SCRIPTS_TABLE,
  WaypointScripts,
} from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { WaypointScriptsHandlerService } from '../waypoint-scripts-handler.service';

/** The waypoint actions of `waypoint_scripts`, one row each. */
@Service()
export class SelectWaypointScriptsService extends SelectService<WaypointScripts> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(WaypointScriptsHandlerService);
  protected override readonly entityTable = WAYPOINT_SCRIPTS_TABLE;
  protected override readonly entityIdField = WAYPOINT_SCRIPTS_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = WAYPOINT_SCRIPTS_SEARCH_FIELDS as (keyof WaypointScripts & string)[];
  protected override readonly selectFields = [
    'id',
    '(COUNT(*)) AS `actions`',
    '(GROUP_CONCAT(DISTINCT `command` ORDER BY `command`)) AS `commands`',
    '(SELECT COUNT(*) FROM `waypoint_data` WHERE `action` = `waypoint_scripts`.`id`) AS `used`',
  ];
  protected override readonly groupFields = ['id'];

  constructor() {
    super();
    this.init();
  }
}
