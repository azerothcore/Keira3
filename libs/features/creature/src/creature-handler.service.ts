import { inject, Injectable } from '@angular/core';
import {
  CREATURE_EQUIP_TEMPLATE_TABLE,
  CREATURE_FORMATIONS_TABLE,
  CREATURE_LOOT_TEMPLATE_TABLE,
  CREATURE_ONKLL_REPUTATION_TABLE,
  CREATURE_QUESTITEM_TABLE,
  CREATURE_SPAWN_ADDON_TABLE,
  CREATURE_SPAWN_TABLE,
  CREATURE_TEMPLATE_ADDON_TABLE,
  CREATURE_TEMPLATE_MODEL_TABLE,
  CREATURE_TEMPLATE_MOVEMENT_TABLE,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CREATURE_TEMPLATE_SPELL_TABLE,
  CREATURE_TEMPLATE_TABLE,
  CREATURE_TEXT_TABLE,
  CreatureTemplate,
  NPC_TRAINER_TABLE,
  NPC_VENDOR_TABLE,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  SAI_TABLE,
  SKINNING_LOOT_TEMPLATE_TABLE,
} from '@keira/shared/acore-world-model';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureHandlerService extends HandlerService<CreatureTemplate> {
  protected saiCreatureHandler = inject(SaiCreatureHandlerService);
  protected readonly mainEditorRoutePath = 'creature/creature-template';

  get isCreatureTemplateUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_TABLE];
  }
  get isCreatureTemplateModelUnsaved(): boolean {
    return this.statusMap[CREATURE_TEMPLATE_MODEL_TABLE];
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
  get isCreatureTextUnsaved(): boolean {
    return this.statusMap[CREATURE_TEXT_TABLE];
  }
  get isCreatureFormationUnsaved(): boolean {
    return this.statusMap[CREATURE_FORMATIONS_TABLE];
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
    [CREATURE_TEXT_TABLE]: false,
    [CREATURE_FORMATIONS_TABLE]: false,
  };

  override select(isNew: boolean, id: string | number | Partial<CreatureTemplate>, name?: string) {
    this.saiCreatureHandler.select(isNew, { entryorguid: +id, source_type: 0 }, null, false);
    super.select(isNew, id, name);
  }
}
