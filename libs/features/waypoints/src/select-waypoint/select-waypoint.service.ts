import { inject, Service } from '@angular/core';
import { WAYPOINT_DATA_ID, WAYPOINT_DATA_SEARCH_FIELDS, WAYPOINT_DATA_TABLE, WaypointData } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { WaypointHandlerService } from '../waypoint-handler.service';

/** The paths of `waypoint_data`, one row each. */
@Service()
export class SelectWaypointService extends SelectService<WaypointData> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(WaypointHandlerService);
  protected override readonly entityTable = WAYPOINT_DATA_TABLE;
  protected override readonly entityIdField = WAYPOINT_DATA_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = WAYPOINT_DATA_SEARCH_FIELDS as (keyof WaypointData & string)[];
  protected override readonly selectFields = [
    'id',
    '(COUNT(*)) AS `points`',
    '(SELECT MIN(`guid`) FROM `creature_addon` WHERE `path_id` = `waypoint_data`.`id`) AS `guid`',
    '(SELECT MIN(`entry`) FROM `creature_template_addon` WHERE `path_id` = `waypoint_data`.`id`) AS `entry`',
    '(SELECT `t`.`name` FROM `creature_template` `t` WHERE `t`.`entry` = COALESCE(' +
      '(SELECT `c`.`id` FROM `creature` `c` JOIN `creature_addon` `a` ON `a`.`guid` = `c`.`guid` WHERE `a`.`path_id` = `waypoint_data`.`id` LIMIT 1), ' +
      '(SELECT `ta`.`entry` FROM `creature_template_addon` `ta` WHERE `ta`.`path_id` = `waypoint_data`.`id` LIMIT 1))) AS `name`',
    '(SELECT `c`.`map` FROM `creature` `c` JOIN `creature_addon` `a` ON `a`.`guid` = `c`.`guid` WHERE `a`.`path_id` = `waypoint_data`.`id` LIMIT 1) AS `map`',
  ];
  protected override readonly groupFields = ['id'];

  constructor() {
    super();
    this.init();
  }
}
