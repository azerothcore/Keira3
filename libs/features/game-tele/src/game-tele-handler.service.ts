import { Injectable } from '@angular/core';
import { GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';
import { HandlerService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class GameTeleHandlerService extends HandlerService<GameTele> {
  protected readonly mainEditorRoutePath = 'game-tele/tele';

  protected get isGameTeleUnsaved(): boolean {
    return this.statusMap[GAME_TELE_TABLE];
  }

  protected _statusMap = {
    [GAME_TELE_TABLE]: false,
  };

  override select(isNew: boolean, id: string | number | Partial<GameTele>, name?: string) {
    super.select(isNew, id, name);
  }
}
