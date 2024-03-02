import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { CREATURE_EQUIP_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { CREATURE_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { CREATURE_ONKLL_REPUTATION_TABLE } from '@keira/acore-world-model';
import { CREATURE_QUESTITEM_TABLE } from '@keira/acore-world-model';
import { CREATURE_SPAWN_ADDON_TABLE } from '@keira/acore-world-model';
import { CREATURE_SPAWN_TABLE } from '@keira/acore-world-model';
import { CREATURE_TEMPLATE_ADDON_TABLE } from '@keira/acore-world-model';
import { CREATURE_TEMPLATE_MOVEMENT_TABLE } from '@keira/acore-world-model';
import { CREATURE_TEMPLATE_RESISTANCE_TABLE } from '@keira/acore-world-model';
import { CREATURE_TEMPLATE_SPELL_TABLE } from '@keira/acore-world-model';
import { CreatureTemplate, CREATURE_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { NPC_TRAINER_TABLE } from '@keira/acore-world-model';
import { NPC_VENDOR_TABLE } from '@keira/acore-world-model';
import { PICKPOCKETING_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { SKINNING_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { SAI_TABLE } from '@keira/acore-world-model';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

@Injectable()
export class CreatureHandlerService extends HandlerService<CreatureTemplate> {
  get isCreatureTemplateUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_TABLE];
  }
  get isCreatureTemplateAddonUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_ADDON_TABLE];
  }
  get isCreatureTemplateResistanceUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_RESISTANCE_TABLE];
  }
  get isCreatureTemplateSpellUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_SPELL_TABLE];
  }
  get isCreatureTemplateMovementUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_MOVEMENT_TABLE];
  }
  get isCreatureOnkillReputationUnsaved(): boolean {
    return this.statusMap[CREATURE_ONKLL_REPUTATION_TABLE];
  }
  get isCreatureEquipTemplateUnsaved(): boolean {
    return this.statusMap[CREATURE_EQUIP_TEMPLATE_TABLE];
  }
  get isNpcVendorUnsaved(): boolean {
    return this.statusMap[NPC_VENDOR_TABLE];
  }
  get isNpcTrainerUnsaved(): boolean {
    return this.statusMap[NPC_TRAINER_TABLE];
  }
  get isCreatureQuestitemUnsaved(): boolean {
    return this.statusMap[CREATURE_QUESTITEM_TABLE];
  }
  get isCreatureLootTemplateUnsaved(): boolean {
    return this.statusMap[CREATURE_LOOT_TEMPLATE_TABLE];
  }
  get isPickpocketingLootTemplateUnsaved(): boolean {
    return this.statusMap[PICKPOCKETING_LOOT_TEMPLATE_TABLE];
  }
  get isSkinningLootTemplateUnsaved(): boolean {
    return this.statusMap[SKINNING_LOOT_TEMPLATE_TABLE];
  }
  get isCreatureSpawnUnsaved(): boolean {
    return this.statusMap[CREATURE_SPAWN_TABLE];
  }
  get isCreatureSpawnAddonUnsaved(): boolean {
    return this.statusMap[CREATURE_SPAWN_ADDON_TABLE];
  }
  get isCreatureSaiUnsaved(): boolean {
    return this.saiCreatureHandler.statusMap[SAI_TABLE];
  }

  protected _statusMap = {
    [CREATURE_TEMPLATE_TABLE]: false,
    [CREATURE_TEMPLATE_ADDON_TABLE]: false,
    [CREATURE_TEMPLATE_RESISTANCE_TABLE]: false,
    [CREATURE_TEMPLATE_SPELL_TABLE]: false,
    [CREATURE_TEMPLATE_MOVEMENT_TABLE]: false,
    [CREATURE_ONKLL_REPUTATION_TABLE]: false,
    [CREATURE_EQUIP_TEMPLATE_TABLE]: false,
    [NPC_VENDOR_TABLE]: false,
    [NPC_TRAINER_TABLE]: false,
    [CREATURE_QUESTITEM_TABLE]: false,
    [CREATURE_LOOT_TEMPLATE_TABLE]: false,
    [PICKPOCKETING_LOOT_TEMPLATE_TABLE]: false,
    [SKINNING_LOOT_TEMPLATE_TABLE]: false,
    [CREATURE_SPAWN_TABLE]: false,
    [CREATURE_SPAWN_ADDON_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected saiCreatureHandler: SaiCreatureHandlerService,
  ) {
    super('creature/creature-template', router);
  }

  select(isNew: boolean, id: string | number | Partial<CreatureTemplate>, name?: string) {
    this.saiCreatureHandler.select(isNew, { entryorguid: +id, source_type: 0 }, null, false);
    super.select(isNew, id, name);
  }
}
