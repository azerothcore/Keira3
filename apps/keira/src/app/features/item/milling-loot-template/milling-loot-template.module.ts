import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { MillingLootTemplateComponent } from './milling-loot-template.component';
import { MillingLootTemplateService } from './milling-loot-template.service';

@NgModule({
  imports: [CommonModule, LootEditorModule, MillingLootTemplateComponent],
  exports: [MillingLootTemplateComponent],
  providers: [MillingLootTemplateService],
})
export class MillingLootTemplateModule {}
