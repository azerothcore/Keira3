import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DisenchantLootTemplateComponent } from './disenchant-loot-template.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';

@NgModule({
  declarations: [DisenchantLootTemplateComponent],
  imports: [CommonModule, TooltipModule, LootEditorModule, TopBarModule],
  exports: [DisenchantLootTemplateComponent],
  providers: [DisenchantLootTemplateService],
})
export class DisenchantLootTemplateModule {}
