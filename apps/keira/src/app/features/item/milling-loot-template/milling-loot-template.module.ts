import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/shared/core';
import { MillingLootTemplateComponent } from './milling-loot-template.component';
import { MillingLootTemplateService } from './milling-loot-template.service';

@NgModule({
  declarations: [MillingLootTemplateComponent],
  imports: [CommonModule, TopBarModule, LootEditorModule],
  exports: [MillingLootTemplateComponent],
  providers: [MillingLootTemplateService],
})
export class MillingLootTemplateModule {}
