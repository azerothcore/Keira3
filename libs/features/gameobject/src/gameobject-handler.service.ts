import { inject, Injectable, signal, Signal } from '@angular/core';
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
  protected override readonly copyRoutePath = 'gameobject/copy';

  get isGameobjectTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_TEMPLATE_TABLE].asReadonly();
  }
  get isGameobjectTemplateAddonUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_TEMPLATE_ADDON_TABLE].asReadonly();
  }
  get isGameobjectQuestitemUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_QUESTITEM_TABLE].asReadonly();
  }
  get isGameobjectLooTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_LOOT_TEMPLATE_TABLE].asReadonly();
  }
  get isGameobjectSpawnUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_SPAWN_TABLE].asReadonly();
  }
  get isGameobjectSpawnAddonUnsaved(): Signal<boolean> {
    return this.statusMap[GAMEOBJECT_SPAWN_ADDON_TABLE].asReadonly();
  }
  get isGameobjectSaiUnsaved(): Signal<boolean> {
    return this.saiGameobjectHandler.statusMap[SAI_TABLE].asReadonly();
  }

  protected _statusMap = {
    [GAMEOBJECT_TEMPLATE_TABLE]: signal(false),
    [GAMEOBJECT_TEMPLATE_ADDON_TABLE]: signal(false),
    [GAMEOBJECT_QUESTITEM_TABLE]: signal(false),
    [GAMEOBJECT_LOOT_TEMPLATE_TABLE]: signal(false),
    [GAMEOBJECT_SPAWN_TABLE]: signal(false),
    [GAMEOBJECT_SPAWN_ADDON_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<GameobjectTemplate>, name?: string, navigate = true, sourceId?: string) {
    this.saiGameobjectHandler.select(isNew, { entryorguid: +id, source_type: 1 }, null, false);

    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
