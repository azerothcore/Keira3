import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_ARENA_SEASON_ID,
  GAME_EVENT_ARENA_SEASON_ID_2,
  GAME_EVENT_ARENA_SEASON_TABLE,
  GameEventArenaSeason,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Arena seasons of the event (game_event_arena_seasons). */
@Service()
export class GameEventArenaSeasonService extends MultiRowEditorService<GameEventArenaSeason> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventArenaSeason;
  protected override readonly _entityTable = GAME_EVENT_ARENA_SEASON_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_ARENA_SEASON_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_ARENA_SEASON_ID_2;

  constructor() {
    super();
    this.init();
  }
}
