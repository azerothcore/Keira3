import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { FishingLootTemplateComponent } from './fishing-loot-template.component';
import { FishingLootTemplateService } from './fishing-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { SelectFishingLootService } from './select-fishing-loot.service';
import { SelectFishingLootComponent } from './select-fishing-loot.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

const components = [
  FishingLootTemplateComponent,
  SelectFishingLootComponent,
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    CommonModule,
    TopBarModule,
    LootEditorModule,
    CreateModule,
    ReactiveFormsModule,
    SearchButtonsModule,
    HighlightModule,
    NgxDatatableModule,
  ],
  providers: [
    FishingLootTemplateService,
    SelectFishingLootService,
    FishingLootHandlerService,
  ],
})
export class FishingLootTemplateModule { }
