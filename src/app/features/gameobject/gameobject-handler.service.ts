import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { GAMEOBJECT_TEMPLATE_TABLE, GameobjectTemplate } from '@keira-types/gameobject-template.type';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';
import { GAMEOBJECT_TEMPLATE_ADDON_TABLE } from '@keira-types/gameobject-template-addon.type';
import { GAMEOBJECT_QUESTITEM_TABLE } from '@keira-types/gameobject-questitem.type';
import { GAMEOBJECT_LOOT_TEMPLATE_TABLE } from '@keira-types/gameobject-loot-template.type';
import { GAMEOBJECT_SPAWN_TABLE } from '@keira-types/gameobject-spawn.type';
import { SAI_TABLE } from '@keira-types/smart-scripts.type';

@Injectable()
export class GameobjectHandlerService extends HandlerService<GameobjectTemplate> {

  get isGameobjectTemplateUnsaved(): boolean { return this.statusMap[GAMEOBJECT_TEMPLATE_TABLE]; }
  get isGameobjectTemplateAddonUnsaved(): boolean { return this.statusMap[GAMEOBJECT_TEMPLATE_ADDON_TABLE]; }
  get isGameobjectQuestitemUnsaved(): boolean { return this.statusMap[GAMEOBJECT_QUESTITEM_TABLE]; }
  get isGameobjectLooTemplateUnsaved(): boolean { return this.statusMap[GAMEOBJECT_LOOT_TEMPLATE_TABLE]; }
  get isGameobjectSpawnUnsaved(): boolean { return this.statusMap[GAMEOBJECT_SPAWN_TABLE]; }
  get isGameobjectSaiUnsaved(): boolean { return this.saiGameobjectHandler.statusMap[SAI_TABLE]; }

  protected _statusMap = {
    [GAMEOBJECT_TEMPLATE_TABLE]: false,
    [GAMEOBJECT_TEMPLATE_ADDON_TABLE]: false,
    [GAMEOBJECT_QUESTITEM_TABLE]: false,
    [GAMEOBJECT_LOOT_TEMPLATE_TABLE]: false,
    [GAMEOBJECT_SPAWN_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected saiGameobjectHandler: SaiGameobjectHandlerService,
  ) {
    super(
      'gameobject/gameobject-template',
      router,
    );
  }

  select(isNew: boolean, id: string|number|Partial<GameobjectTemplate>, name?: string) {
    this.saiGameobjectHandler.select(isNew, { entryorguid: +id, source_type: 1 }, null, false);
    super.select(isNew, id, name);
  }
}
