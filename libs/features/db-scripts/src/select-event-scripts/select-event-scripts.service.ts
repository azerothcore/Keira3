import { inject, Service } from '@angular/core';
import { EVENT_SCRIPTS_ID, EVENT_SCRIPTS_SEARCH_FIELDS, EVENT_SCRIPTS_TABLE, EventScripts } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { EventScriptsHandlerService } from '../event-scripts-handler.service';

/** The event scripts, one row each: how many steps, which commands, and the gameobjects starting them. */
@Service()
export class SelectEventScriptsService extends SelectService<EventScripts> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(EventScriptsHandlerService);
  protected override readonly entityTable = EVENT_SCRIPTS_TABLE;
  protected override readonly entityIdField = EVENT_SCRIPTS_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = EVENT_SCRIPTS_SEARCH_FIELDS as (keyof EventScripts & string)[];
  protected override readonly selectFields = [
    'id',
    '(COUNT(*)) AS `steps`',
    '(GROUP_CONCAT(DISTINCT `command` ORDER BY `command`)) AS `commands`',
    '(SELECT COUNT(*) FROM `gameobject_template` WHERE (`type` = 10 AND `Data2` = `event_scripts`.`id`) OR (`type` = 3 AND `Data6` = `event_scripts`.`id`)) AS `gameobjects`',
  ];
  protected override readonly groupFields = ['id'];

  constructor() {
    super();
    this.init();
  }
}
