import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAMEOBJECT_TEMPLATE_ADDON_ID, GAMEOBJECT_TEMPLATE_ADDON_TABLE, GameobjectTemplateAddon } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectTemplateAddonService extends SingleRowEditorService<GameobjectTemplateAddon> {
  protected override readonly handlerService: GameobjectHandlerService;

  constructor() {
    const handlerService = inject(GameobjectHandlerService);

    super(GameobjectTemplateAddon, GAMEOBJECT_TEMPLATE_ADDON_TABLE, GAMEOBJECT_TEMPLATE_ADDON_ID, null, true, handlerService);

    this.handlerService = handlerService;
  }
}
