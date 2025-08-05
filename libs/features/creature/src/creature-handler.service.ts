import { inject, Injectable, signal, Signal } from '@angular/core';
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

  get isCreatureTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_TABLE].asReadonly();
  }
  get isCreatureTemplateModelUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_MODEL_TABLE].asReadonly();
  }
  get isCreatureTemplateAddonUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_ADDON_TABLE].asReadonly();
  }
  get isCreatureTemplateResistanceUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_RESISTANCE_TABLE].asReadonly();
  }
  get isCreatureTemplateSpellUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_SPELL_TABLE].asReadonly();
  }
  get isCreatureTemplateMovementUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEMPLATE_MOVEMENT_TABLE].asReadonly();
  }
  get isCreatureOnkillReputationUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_ONKLL_REPUTATION_TABLE].asReadonly();
  }
  get isCreatureEquipTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_EQUIP_TEMPLATE_TABLE].asReadonly();
  }
  get isNpcVendorUnsaved(): Signal<boolean> {
    return this.statusMap[NPC_VENDOR_TABLE].asReadonly();
  }
  get isNpcTrainerUnsaved(): Signal<boolean> {
    return this.statusMap[NPC_TRAINER_TABLE].asReadonly();
  }
  get isCreatureQuestitemUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_QUESTITEM_TABLE].asReadonly();
  }
  get isCreatureLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_LOOT_TEMPLATE_TABLE].asReadonly();
  }
  get isPickpocketingLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[PICKPOCKETING_LOOT_TEMPLATE_TABLE].asReadonly();
  }
  get isSkinningLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[SKINNING_LOOT_TEMPLATE_TABLE].asReadonly();
  }
  get isCreatureSpawnUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_SPAWN_TABLE].asReadonly();
  }
  get isCreatureSpawnAddonUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_SPAWN_ADDON_TABLE].asReadonly();
  }
  get isCreatureSaiUnsaved(): Signal<boolean> {
    return this.saiCreatureHandler.statusMap[SAI_TABLE].asReadonly();
  }
  get isCreatureTextUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_TEXT_TABLE].asReadonly();
  }
  get isCreatureFormationUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_FORMATIONS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [CREATURE_TEMPLATE_TABLE]: signal(false),
    [CREATURE_TEMPLATE_MODEL_TABLE]: signal(false),
    [CREATURE_TEMPLATE_ADDON_TABLE]: signal(false),
    [CREATURE_TEMPLATE_RESISTANCE_TABLE]: signal(false),
    [CREATURE_TEMPLATE_SPELL_TABLE]: signal(false),
    [CREATURE_TEMPLATE_MOVEMENT_TABLE]: signal(false),
    [CREATURE_ONKLL_REPUTATION_TABLE]: signal(false),
    [CREATURE_EQUIP_TEMPLATE_TABLE]: signal(false),
    [NPC_VENDOR_TABLE]: signal(false),
    [NPC_TRAINER_TABLE]: signal(false),
    [CREATURE_QUESTITEM_TABLE]: signal(false),
    [CREATURE_LOOT_TEMPLATE_TABLE]: signal(false),
    [PICKPOCKETING_LOOT_TEMPLATE_TABLE]: signal(false),
    [SKINNING_LOOT_TEMPLATE_TABLE]: signal(false),
    [CREATURE_SPAWN_TABLE]: signal(false),
    [CREATURE_SPAWN_ADDON_TABLE]: signal(false),
    [CREATURE_TEXT_TABLE]: signal(false),
    [CREATURE_FORMATIONS_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<CreatureTemplate>, name?: string) {
    this.saiCreatureHandler.select(isNew, { entryorguid: +id, source_type: 0 }, null, false);
    super.select(isNew, id, name);
  }
}
