import { NgModule } from '@angular/core';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

@NgModule({
  declarations: [
    PickpocketingLootTemplateComponent,
  ],
  imports: [
    TopBarModule,
    LootEditorModule,
  ],
  exports: [
    PickpocketingLootTemplateComponent,
  ],
  providers: [
    PickpocketingLootTemplateService,
  ],
})
export class PickpocketingLootTemplateModule {}
