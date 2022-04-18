import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';

@NgModule({
  declarations: [GameobjectLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [GameobjectLootTemplateComponent],
  providers: [GameobjectLootTemplateService, GameobjectHandlerService],
})
export class GameobjectLootTemplateModule {}
