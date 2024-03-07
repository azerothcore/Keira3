import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { ProspectingLootTemplateComponent } from './prospecting-loot-template.component';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';

@NgModule({
  imports: [CommonModule, LootEditorModule, ProspectingLootTemplateComponent],
  exports: [ProspectingLootTemplateComponent],
  providers: [ProspectingLootTemplateService],
})
export class ProspectingLootTemplateModule {}
