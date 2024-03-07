import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';

@NgModule({
  imports: [CommonModule, LootEditorModule, PickpocketingLootTemplateComponent],
  exports: [PickpocketingLootTemplateComponent],
  providers: [PickpocketingLootTemplateService],
})
export class PickpocketingLootTemplateModule {}
