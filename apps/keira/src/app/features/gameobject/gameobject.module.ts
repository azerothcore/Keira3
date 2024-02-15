import { NgModule } from '@angular/core';
import { GameobjectHandlerService } from './gameobject-handler.service';
import { GameobjectLootTemplateModule } from './gameobject-loot-template/gameobject-loot-template.module';
import { GameobjectQuestitemModule } from './gameobject-questitem/gameobject-questitem.module';
import { GameobjectSpawnAddonModule } from './gameobject-spawn-addon/gameobject-spawn-addon.module';
import { GameobjectSpawnModule } from './gameobject-spawn/gameobject-spawn.module';
import { GameobjectTemplateAddonModule } from './gameobject-template-addon/gameobject-template-addon.module';
import { GameobjectTemplateModule } from './gameobject-template/gameobject-template.module';
import { SaiGameobjectHandlerService } from './sai-gameobject-handler.service';
import { SaiGameobjectModule } from './sai-gameobject/sai-gameobject.module';
import { SelectGameobjectModule } from './select-gameobject/select-gameobject.module';

const modules = [
  SelectGameobjectModule,
  GameobjectTemplateModule,
  GameobjectTemplateAddonModule,
  GameobjectQuestitemModule,
  GameobjectSpawnModule,
  GameobjectSpawnAddonModule,
  GameobjectLootTemplateModule,
  SaiGameobjectModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
  providers: [GameobjectHandlerService, SaiGameobjectHandlerService],
})
export class GameobjectModule {}
