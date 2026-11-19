import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_NPCFLAG_ID,
  GAME_EVENT_NPCFLAG_ID_2,
  GAME_EVENT_NPCFLAG_TABLE,
  GameEventNpcflag,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** NPC flags by the event (game_event_npcflag). */
@Service()
export class GameEventNpcflagService extends MultiRowEditorService<GameEventNpcflag> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventNpcflag;
  protected override readonly _entityTable = GAME_EVENT_NPCFLAG_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_NPCFLAG_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_NPCFLAG_ID_2;

  constructor() {
    super();
    this.init();
  }
}
