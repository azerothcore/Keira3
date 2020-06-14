import { NgModule } from '@angular/core';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

@NgModule({
  declarations: [
    GameobjectLootTemplateComponent,
  ],
  imports: [
    TopBarModule,
    LootEditorModule,
  ],
  exports: [
    GameobjectLootTemplateComponent,
  ],
  providers: [
    GameobjectLootTemplateService,
    GameobjectHandlerService,
  ],
})
export class GameobjectLootTemplateModule {}
