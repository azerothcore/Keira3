import { inject, Service } from '@angular/core';
import { GAME_EVENT_ID, GAME_EVENT_NAME, GAME_EVENT_TABLE, GameEvent } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameEventHandlerService } from '../game-event-handler.service';

@Service()
export class GameEventService extends SingleRowEditorService<GameEvent> {
  protected override readonly handlerService = inject(GameEventHandlerService);
  protected override _entityClass = GameEvent;
  protected override _entityTable = GAME_EVENT_TABLE;
  protected override _entityIdField = GAME_EVENT_ID;
  protected override _entityNameField = GAME_EVENT_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
