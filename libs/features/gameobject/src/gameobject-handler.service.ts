import { inject, Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_LOOT_TEMPLATE_TABLE,
  GAMEOBJECT_QUESTITEM_TABLE,
  GAMEOBJECT_SPAWN_ADDON_TABLE,
  GAMEOBJECT_SPAWN_TABLE,
  GAMEOBJECT_TEMPLATE_ADDON_TABLE,
  GAMEOBJECT_TEMPLATE_TABLE,
  GameobjectTemplate,
  SAI_TABLE,
} from '@keira/shared/acore-world-model';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectHandlerService extends HandlerService<GameobjectTemplate> {
  protected saiGameobjectHandler = inject(SaiGameobjectHandlerService);
  protected readonly mainEditorRoutePath = 'gameobject/gameobject-template';

  get isGameobjectTemplateUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_TEMPLATE_TABLE];
  }
  get isGameobjectTemplateAddonUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_TEMPLATE_ADDON_TABLE];
  }
  get isGameobjectQuestitemUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_QUESTITEM_TABLE];
  }
  get isGameobjectLooTemplateUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_LOOT_TEMPLATE_TABLE];
  }
  get isGameobjectSpawnUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_SPAWN_TABLE];
  }
  get isGameobjectSpawnAddonUnsaved(): boolean {
    return this.statusMap[GAMEOBJECT_SPAWN_ADDON_TABLE];
  }
  get isGameobjectSaiUnsaved(): boolean {
    return this.saiGameobjectHandler.statusMap[SAI_TABLE];
  }

  protected _statusMap = {
    [GAMEOBJECT_TEMPLATE_TABLE]: false,
    [GAMEOBJECT_TEMPLATE_ADDON_TABLE]: false,
    [GAMEOBJECT_QUESTITEM_TABLE]: false,
    [GAMEOBJECT_LOOT_TEMPLATE_TABLE]: false,
    [GAMEOBJECT_SPAWN_TABLE]: false,
    [GAMEOBJECT_SPAWN_ADDON_TABLE]: false,
  };

  select(isNew: boolean, id: string | number | Partial<GameobjectTemplate>, name?: string) {
    this.saiGameobjectHandler.select(isNew, { entryorguid: +id, source_type: 1 }, null, false);
    super.select(isNew, id, name);
  }
}
