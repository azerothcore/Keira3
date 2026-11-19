import { inject, Service } from '@angular/core';
import { GAME_EVENT_ID, GAME_EVENT_NAME, GAME_EVENT_SEARCH_FIELDS, GAME_EVENT_TABLE, GameEvent } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GameEventHandlerService } from '../game-event-handler.service';

/** The game events, with how many creatures and gameobjects each spawns or removes. */
@Service()
export class SelectGameEventService extends SelectService<GameEvent> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly entityTable = GAME_EVENT_TABLE;
  protected override readonly entityIdField = GAME_EVENT_ID;
  protected override entityNameField = GAME_EVENT_NAME;
  protected override readonly fieldList = GAME_EVENT_SEARCH_FIELDS as (keyof GameEvent & string)[];
  protected override readonly selectFields = [
    '*',
    '(SELECT COUNT(*) FROM `game_event_creature` `c` WHERE ABS(`c`.`eventEntry`) = `game_event`.`eventEntry`) AS `creatures`',
    '(SELECT COUNT(*) FROM `game_event_gameobject` `g` WHERE ABS(`g`.`eventEntry`) = `game_event`.`eventEntry`) AS `gameobjects`',
  ];
  protected override readonly orderFields = [GAME_EVENT_ID];

  constructor() {
    super();
    this.init();
  }
}
