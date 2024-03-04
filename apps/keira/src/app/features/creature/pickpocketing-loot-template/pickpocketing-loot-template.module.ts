import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/shared/core';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';

@NgModule({
  declarations: [PickpocketingLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [PickpocketingLootTemplateComponent],
  providers: [PickpocketingLootTemplateService],
})
export class PickpocketingLootTemplateModule {}
