import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_GAMEOBJECT_ID,
  GAME_EVENT_GAMEOBJECT_ID_2,
  GAME_EVENT_GAMEOBJECT_TABLE,
  GameEventGameobject,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Gameobjects spawned by the event (game_event_gameobject). */
@Service()
export class GameEventGameobjectService extends MultiRowEditorService<GameEventGameobject> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventGameobject;
  protected override readonly _entityTable = GAME_EVENT_GAMEOBJECT_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_GAMEOBJECT_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_GAMEOBJECT_ID_2;

  constructor() {
    super();
    this.init();
  }
}
