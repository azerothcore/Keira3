import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
