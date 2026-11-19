import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_BATTLEGROUND_HOLIDAY_ID,
  GAME_EVENT_BATTLEGROUND_HOLIDAY_ID_2,
  GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE,
  GameEventBattlegroundHoliday,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Battleground holiday by the event (game_event_battleground_holiday). */
@Service()
export class GameEventBattlegroundHolidayService extends MultiRowEditorService<GameEventBattlegroundHoliday> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventBattlegroundHoliday;
  protected override readonly _entityTable = GAME_EVENT_BATTLEGROUND_HOLIDAY_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_BATTLEGROUND_HOLIDAY_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_BATTLEGROUND_HOLIDAY_ID_2;

  constructor() {
    super();
    this.init();
  }
}
