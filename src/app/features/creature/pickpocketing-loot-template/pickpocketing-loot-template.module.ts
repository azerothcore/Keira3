import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';

@NgModule({
  declarations: [PickpocketingLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [PickpocketingLootTemplateComponent],
  providers: [PickpocketingLootTemplateService],
})
export class PickpocketingLootTemplateModule {}
