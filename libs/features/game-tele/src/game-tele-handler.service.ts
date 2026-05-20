import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class GameTeleHandlerService extends HandlerService<GameTele> {
  protected readonly mainEditorRoutePath = 'game-tele/tele';
  protected override readonly copyRoutePath = 'game-tele/copy';

  get isGameTeleUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_TELE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GAME_TELE_TABLE]: signal(false),
  };
}
