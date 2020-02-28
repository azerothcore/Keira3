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
import { CreatureSpawnModule } from './creature-spawn/creature-spawn.module';
import { CreatureSpawnAddonModule } from './creature-spawn-addon/creature-spawn-addon.module';
import { NpcVendorModule } from './npc-vendor/npc-vendor.module';
import { CreatureQuestitemModule } from './creature-questitem/creature-questitem.module';
import { SaiCreatureModule } from './sai-creature/sai-creature.module';
import { CreatureHandlerService } from './creature-handler.service';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

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
  CreatureSpawnModule,
  CreatureSpawnAddonModule,
  SaiCreatureModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [
    CreatureHandlerService,
    SaiCreatureHandlerService,
  ],
})
export class CreatureModule {}
