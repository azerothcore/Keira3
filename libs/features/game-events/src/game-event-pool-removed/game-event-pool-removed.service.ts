import { ChangeDetectorRef, inject, Service } from '@angular/core';
import { GAME_EVENT_POOL_ID, GAME_EVENT_POOL_ID_2, GAME_EVENT_POOL_TABLE, GameEventPool } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Pools removed by the event (game_event_pool, eventEntry negated). */
@Service()
export class GameEventPoolRemovedService extends MultiRowEditorService<GameEventPool> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventPool;
  protected override readonly _entityTable = GAME_EVENT_POOL_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_POOL_ID_2;
  protected override readonly _entitySecondIdField = GAME_EVENT_POOL_ID;

  constructor() {
    super();
    this.init();
  }

  /** The rows of the event's id negated: what the event removes while it runs. */
  override reload(changeDetectorRef: ChangeDetectorRef, id: string | number): void {
    super.reload(changeDetectorRef, -Math.abs(Number(id)));
  }
}
