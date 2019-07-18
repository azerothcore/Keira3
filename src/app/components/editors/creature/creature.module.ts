import { NgModule } from '@angular/core';

import { CreatureEquipTemplateModule } from './creature-equip-template/creature-equip-template.module';
import { CreatureLootTemplateModule } from './creature-loot-template/creature-loot-template.module';
import { CreatureOnkillReputationModule } from './creature-onkill-reputation/creature-onkill-reputation.module';
import { CreatureTemplateModule } from './creature-template/creature-template.module';
import { CreatureTemplateAddonModule } from './creature-template-addon/creature-template-addon.module';
import { NpcTrainerModule } from './npc-trainer/npc-trainer.module';
import { PickpocketingLootTemplateModule } from './pickpocketing-loot-template/pickpocketing-loot-template.module';
import { SelectCreatureModule } from './select-creature/select-creature.module';
import { SkinningLootTemplateModule } from './skinning-loot-template/skinning-loot-template.module';
import { SpawnsModule } from './spawns/spawns.module';
import { SpawnsAddonModule } from './spawns-addon/spawns-addon.module';
import { NpcVendorModule } from './npc-vendor/npc-vendor.module';
import { CreatureQuestitemModule } from './creature-questitem/creature-questitem.module';

const modules = [
  CreatureEquipTemplateModule,
  CreatureLootTemplateModule,
  CreatureOnkillReputationModule,
  CreatureTemplateModule,
  CreatureTemplateAddonModule,
  CreatureQuestitemModule,
  NpcTrainerModule,
  NpcVendorModule,
  PickpocketingLootTemplateModule,
  SelectCreatureModule,
  SkinningLootTemplateModule,
  SpawnsModule,
  SpawnsAddonModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class CreatureModule {}
