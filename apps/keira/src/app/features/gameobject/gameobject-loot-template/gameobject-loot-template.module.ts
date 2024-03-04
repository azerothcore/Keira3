import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectLootTemplateComponent } from './gameobject-loot-template.component';
import { GameobjectLootTemplateService } from './gameobject-loot-template.service';

@NgModule({
  declarations: [GameobjectLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule, TranslateModule],
  exports: [GameobjectLootTemplateComponent],
  providers: [GameobjectLootTemplateService, GameobjectHandlerService],
})
export class GameobjectLootTemplateModule {}
