import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_PREREQUISITE_ID,
  GAME_EVENT_PREREQUISITE_ID_2,
  GAME_EVENT_PREREQUISITE_TABLE,
  GameEventPrerequisite,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Prerequisite events by the event (game_event_prerequisite). */
@Service()
export class GameEventPrerequisiteService extends MultiRowEditorService<GameEventPrerequisite> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventPrerequisite;
  protected override readonly _entityTable = GAME_EVENT_PREREQUISITE_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_PREREQUISITE_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_PREREQUISITE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
