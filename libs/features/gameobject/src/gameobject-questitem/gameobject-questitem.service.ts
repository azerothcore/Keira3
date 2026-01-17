import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_QUESTITEM_ID_2,
  GAMEOBJECT_QUESTITEM_TABLE,
  GameobjectQuestitem,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectQuestitemService extends MultiRowEditorService<GameobjectQuestitem> {
  protected override readonly handlerService = inject(GameobjectHandlerService);
  protected override readonly _entityClass = GameobjectQuestitem;
  protected override readonly _entityTable = GAMEOBJECT_QUESTITEM_TABLE;
  protected override readonly _entityIdField = GAMEOBJECT_QUESTITEM_ID;
  protected override readonly _entitySecondIdField = GAMEOBJECT_QUESTITEM_ID_2;

  constructor() {
    super();
    this.init();
  }
}
