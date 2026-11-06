import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_CREATURE_QUEST_ID,
  GAME_EVENT_CREATURE_QUEST_ID_2,
  GAME_EVENT_CREATURE_QUEST_ID_3,
  GAME_EVENT_CREATURE_QUEST_TABLE,
  GameEventCreatureQuest,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Creature quests by the event (game_event_creature_quest). */
@Service()
export class GameEventCreatureQuestService extends MultiRowEditorService<GameEventCreatureQuest> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventCreatureQuest;
  protected override readonly _entityTable = GAME_EVENT_CREATURE_QUEST_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_CREATURE_QUEST_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_CREATURE_QUEST_ID_2;
  protected override readonly _entityExtraIdField = GAME_EVENT_CREATURE_QUEST_ID_3;

  constructor() {
    super();
    this.init();
  }
}
