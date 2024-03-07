import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DisenchantLootTemplateComponent } from './disenchant-loot-template.component';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';

@NgModule({
  imports: [CommonModule, TooltipModule, LootEditorModule, DisenchantLootTemplateComponent],
  exports: [DisenchantLootTemplateComponent],
  providers: [DisenchantLootTemplateService],
})
export class DisenchantLootTemplateModule {}
