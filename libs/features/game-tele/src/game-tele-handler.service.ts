import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class GameTeleHandlerService extends HandlerService<GameTele> {
  protected readonly mainEditorRoutePath = 'game-tele/tele';
  protected readonly copyRoutePath = 'game-tele/copy';

  get isGameTeleUnsaved(): Signal<boolean> {
    return this.statusMap[GAME_TELE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GAME_TELE_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<GameTele>, name?: string, navigate = true, sourceId?: string) {
    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
