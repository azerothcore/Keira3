import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule, TopBarModule } from '@keira/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DisenchantLootTemplateComponent } from './disenchant-loot-template.component';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';

@NgModule({
  declarations: [DisenchantLootTemplateComponent],
  imports: [CommonModule, TooltipModule, LootEditorModule, TopBarModule],
  exports: [DisenchantLootTemplateComponent],
  providers: [DisenchantLootTemplateService],
})
export class DisenchantLootTemplateModule {}
