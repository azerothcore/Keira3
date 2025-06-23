import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAME_TELE_ID, GAME_TELE_NAME, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';
import { GameTeleHandlerService } from '../game-tele-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameTeleService extends SingleRowEditorService<GameTele> {
  protected override readonly handlerService = inject(GameTeleHandlerService);
  protected override _entityClass = GameTele;
  protected override _entityTable = GAME_TELE_TABLE;
  protected override _entityIdField = GAME_TELE_ID;
  protected override _entityNameField = GAME_TELE_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
