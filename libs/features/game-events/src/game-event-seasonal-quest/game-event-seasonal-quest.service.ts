import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_SEASONAL_QUEST_ID,
  GAME_EVENT_SEASONAL_QUEST_ID_2,
  GAME_EVENT_SEASONAL_QUEST_TABLE,
  GameEventSeasonalQuest,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Seasonal quests by the event (game_event_seasonal_questrelation). */
@Service()
export class GameEventSeasonalQuestService extends MultiRowEditorService<GameEventSeasonalQuest> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventSeasonalQuest;
  protected override readonly _entityTable = GAME_EVENT_SEASONAL_QUEST_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_SEASONAL_QUEST_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_SEASONAL_QUEST_ID_2;

  constructor() {
    super();
    this.init();
  }
}
