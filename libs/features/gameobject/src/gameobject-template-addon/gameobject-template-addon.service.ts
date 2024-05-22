import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAMEOBJECT_TEMPLATE_ADDON_ID, GAMEOBJECT_TEMPLATE_ADDON_TABLE, GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: GameobjectHandlerService) {
    super(GameobjectTemplateAddon, GAMEOBJECT_TEMPLATE_ADDON_TABLE, GAMEOBJECT_TEMPLATE_ADDON_ID, null, true, handlerService);
  }
}
