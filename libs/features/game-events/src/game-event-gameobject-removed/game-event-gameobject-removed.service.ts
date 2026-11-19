import { inject, Service, ChangeDetectorRef } from '@angular/core';
import {
  GAME_EVENT_GAMEOBJECT_ID,
  GAME_EVENT_GAMEOBJECT_ID_2,
  GAME_EVENT_GAMEOBJECT_TABLE,
  GameEventGameobject,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Gameobjects removed by the event (game_event_gameobject, eventEntry negated). */
@Service()
export class GameEventGameobjectRemovedService extends MultiRowEditorService<GameEventGameobject> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventGameobject;
  protected override readonly _entityTable = GAME_EVENT_GAMEOBJECT_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_GAMEOBJECT_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_GAMEOBJECT_ID_2;

  constructor() {
    super();
    this.init();
  }

  /** The rows of the event's id negated: what the event removes while it runs. */
  override reload(changeDetectorRef: ChangeDetectorRef, id: string | number): void {
    super.reload(changeDetectorRef, -Math.abs(Number(id)));
  }
}
