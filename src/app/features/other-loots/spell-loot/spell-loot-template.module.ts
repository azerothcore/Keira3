import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { SpellLootTemplateComponent } from './spell-loot-template.component';
import { SpellLootTemplateService } from './spell-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SelectSpellLootComponent } from './select-spell-loot.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

const components = [
  SpellLootTemplateComponent,
  SelectSpellLootComponent,
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
    SpellLootTemplateService,
    SelectSpellLootService,
    SpellLootHandlerService,
  ],
})
export class SpellLootTemplateModule { }
