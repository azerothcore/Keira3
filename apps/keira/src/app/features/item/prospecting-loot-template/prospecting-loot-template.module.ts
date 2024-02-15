import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { ProspectingLootTemplateComponent } from './prospecting-loot-template.component';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';

@NgModule({
  declarations: [ProspectingLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [ProspectingLootTemplateComponent],
  providers: [ProspectingLootTemplateService],
})
export class ProspectingLootTemplateModule {}
