import { inject, Service, ChangeDetectorRef } from '@angular/core';
import {
  GAME_EVENT_CREATURE_ID,
  GAME_EVENT_CREATURE_ID_2,
  GAME_EVENT_CREATURE_TABLE,
  GameEventCreature,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Creatures removed by the event (game_event_creature, eventEntry negated). */
@Service()
export class GameEventCreatureRemovedService extends MultiRowEditorService<GameEventCreature> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventCreature;
  protected override readonly _entityTable = GAME_EVENT_CREATURE_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_CREATURE_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_CREATURE_ID_2;

  constructor() {
    super();
    this.init();
  }

  /** The rows of the event's id negated: what the event removes while it runs. */
  override reload(changeDetectorRef: ChangeDetectorRef, id: string | number): void {
    super.reload(changeDetectorRef, -Math.abs(Number(id)));
  }
}
