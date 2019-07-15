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

@NgModule({
  imports: [
    CreatureEquipTemplateModule,
    CreatureLootTemplateModule,
    CreatureOnkillReputationModule,
    CreatureTemplateModule,
    CreatureTemplateAddonModule,
    NpcTrainerModule,
    PickpocketingLootTemplateModule,
    SelectCreatureModule,
    SkinningLootTemplateModule,
    SpawnsModule,
    SpawnsAddonModule,
  ],
  exports: [
    CreatureEquipTemplateModule,
    CreatureLootTemplateModule,
    CreatureOnkillReputationModule,
    CreatureTemplateModule,
    CreatureTemplateAddonModule,
    NpcTrainerModule,
    PickpocketingLootTemplateModule,
    SelectCreatureModule,
    SkinningLootTemplateModule,
    SpawnsModule,
    SpawnsAddonModule,
  ],
})
export class CreatureModule {}
