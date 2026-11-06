import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_CONDITION_ID,
  GAME_EVENT_CONDITION_ID_2,
  GAME_EVENT_CONDITION_TABLE,
  GameEventCondition,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Conditions of the event (game_event_condition). */
@Service()
export class GameEventConditionService extends MultiRowEditorService<GameEventCondition> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventCondition;
  protected override readonly _entityTable = GAME_EVENT_CONDITION_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_CONDITION_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_CONDITION_ID_2;

  constructor() {
    super();
    this.init();
  }
}
