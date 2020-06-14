import { NgModule } from '@angular/core';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { ProspectingLootTemplateComponent } from './prospecting-loot-template.component';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';

@NgModule({
  declarations: [
    ProspectingLootTemplateComponent,
  ],
  imports: [
    TopBarModule,
    LootEditorModule,
  ],
  exports: [
    ProspectingLootTemplateComponent,
  ],
  providers: [
    ProspectingLootTemplateService,
  ],
})
export class ProspectingLootTemplateModule {}
