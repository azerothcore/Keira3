import { inject, Service } from '@angular/core';
import { SCRIPT_WAYPOINT_ID, SCRIPT_WAYPOINT_SEARCH_FIELDS, SCRIPT_WAYPOINT_TABLE, ScriptWaypoint } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ScriptWaypointHandlerService } from '../script-waypoint-handler.service';

/** The escort paths of `script_waypoint`, one row each: the creature walking it, its points and where it's spawned. */
@Service()
export class SelectScriptWaypointService extends SelectService<ScriptWaypoint> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(ScriptWaypointHandlerService);
  protected override readonly entityTable = SCRIPT_WAYPOINT_TABLE;
  protected override readonly entityIdField = SCRIPT_WAYPOINT_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = SCRIPT_WAYPOINT_SEARCH_FIELDS as (keyof ScriptWaypoint & string)[];
  protected override readonly selectFields = [
    'entry',
    '(COUNT(*)) AS `points`',
    '(SELECT `name` FROM `creature_template` WHERE `entry` = `script_waypoint`.`entry`) AS `name`',
    '(SELECT MIN(`map`) FROM `creature` WHERE `id` = `script_waypoint`.`entry`) AS `map`',
  ];
  protected override readonly groupFields = ['entry'];

  constructor() {
    super();
    this.init();
  }
}
