import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { MillingLootTemplateComponent } from './milling-loot-template.component';
import { MillingLootTemplateService } from './milling-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

@NgModule({
  declarations: [
    MillingLootTemplateComponent,
  ],
  imports: [
    CommonModule,
    TopBarModule,
    LootEditorModule,
  ],
  exports: [
    MillingLootTemplateComponent,
  ],
  providers: [
    MillingLootTemplateService,
  ],
})
export class MillingLootTemplateModule { }
