import { inject, Service } from '@angular/core';
import {
  GAME_EVENT_CREATURE_ID,
  GAME_EVENT_CREATURE_ID_2,
  GAME_EVENT_CREATURE_TABLE,
  GameEventCreature,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

/** Creatures spawned by the event (game_event_creature). */
@Service()
export class GameEventCreatureService extends MultiRowEditorService<GameEventCreature> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override readonly _entityClass = GameEventCreature;
  protected override readonly _entityTable = GAME_EVENT_CREATURE_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_CREATURE_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_CREATURE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
