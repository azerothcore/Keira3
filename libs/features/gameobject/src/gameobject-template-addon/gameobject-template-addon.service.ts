import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAMEOBJECT_TEMPLATE_ADDON_ID, GAMEOBJECT_TEMPLATE_ADDON_TABLE, GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {
  protected override readonly handlerService = inject(GameobjectHandlerService);
  protected override _entityClass = GameobjectTemplateAddon;
  protected override _entityTable = GAMEOBJECT_TEMPLATE_ADDON_TABLE;
  protected override _entityIdField = GAMEOBJECT_TEMPLATE_ADDON_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = true;

  constructor() {
    super();
  }
}
