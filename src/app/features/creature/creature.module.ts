import { NgModule } from '@angular/core';
import { CreatureEquipTemplateModule } from './creature-equip-template/creature-equip-template.module';
import { CreatureHandlerService } from './creature-handler.service';
import { CreatureLootTemplateModule } from './creature-loot-template/creature-loot-template.module';
import { CreatureOnkillReputationModule } from './creature-onkill-reputation/creature-onkill-reputation.module';
import { CreatureQuestitemModule } from './creature-questitem/creature-questitem.module';
import { CreatureSpawnAddonModule } from './creature-spawn-addon/creature-spawn-addon.module';
import { CreatureSpawnModule } from './creature-spawn/creature-spawn.module';
import { CreatureTemplateAddonModule } from './creature-template-addon/creature-template-addon.module';
import { CreatureTemplateMovementModule } from './creature-template-movement/creature-template-movement.module';
import { CreatureTemplateResistanceModule } from './creature-template-resistance/creature-template-resistance.module';
import { CreatureTemplateSpellModule } from './creature-template-spell/creature-template-spell.module';
import { CreatureTemplateModule } from './creature-template/creature-template.module';
import { NpcTrainerModule } from './npc-trainer/npc-trainer.module';
import { NpcVendorModule } from './npc-vendor/npc-vendor.module';
import { PickpocketingLootTemplateModule } from './pickpocketing-loot-template/pickpocketing-loot-template.module';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';
import { SaiCreatureModule } from './sai-creature/sai-creature.module';
import { SelectCreatureModule } from './select-creature/select-creature.module';
import { SkinningLootTemplateModule } from './skinning-loot-template/skinning-loot-template.module';

const modules = [
  CreatureEquipTemplateModule,
  CreatureLootTemplateModule,
  CreatureOnkillReputationModule,
  CreatureTemplateModule,
  CreatureTemplateAddonModule,
  CreatureTemplateResistanceModule,
  CreatureTemplateSpellModule,
  CreatureTemplateMovementModule,
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
  providers: [CreatureHandlerService, SaiCreatureHandlerService],
})
export class CreatureModule {}
