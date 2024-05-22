import { Injectable } from '@angular/core';
import { LootEditorIdService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_LOOT_TEMPLATE_TABLE,
  GAMEOBJECT_TEMPLATE_ID,
  GAMEOBJECT_TEMPLATE_LOOT_ID,
  GAMEOBJECT_TEMPLATE_TABLE,
  GAMEOBJECT_TEMPLATE_TYPE,
  GameobjectLootTemplate,
} from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectLootTemplateService extends LootEditorIdService<GameobjectLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: GameobjectHandlerService) {
    super(
      GameobjectLootTemplate,
      GAMEOBJECT_LOOT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_TABLE,
      GAMEOBJECT_TEMPLATE_ID,
      GAMEOBJECT_TEMPLATE_LOOT_ID,
      handlerService,
    );
  }

  getType(): Observable<{ type: number }[]> {
    return this.queryService.query(
      `SELECT ${GAMEOBJECT_TEMPLATE_TYPE} ` +
        `FROM ${GAMEOBJECT_TEMPLATE_TABLE} ` +
        `WHERE ${GAMEOBJECT_TEMPLATE_ID} = ${this.handlerService.selected}`,
    );
  }
}
