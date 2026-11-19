import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_QUEST_CONDITION_ID,
  GAME_EVENT_QUEST_CONDITION_ID_2,
  GAME_EVENT_QUEST_CONDITION_TABLE,
  GameEventQuestCondition,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Quest conditions of the event (game_event_quest_condition). */
@Service()
export class GameEventQuestConditionService extends MultiRowEditorService<GameEventQuestCondition> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventQuestCondition;
  protected override readonly _entityTable = GAME_EVENT_QUEST_CONDITION_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_QUEST_CONDITION_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_QUEST_CONDITION_ID_2;

  constructor() {
    super();
    this.init();
  }
}
