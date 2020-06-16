import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { ReferenceLootTemplateComponent } from './reference-loot-template.component';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

const components = [
  ReferenceLootTemplateComponent,
  SelectReferenceLootComponent,
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
    ReferenceLootTemplateService,
    SelectReferenceLootService,
    ReferenceLootHandlerService,
  ],
})
export class ReferenceLootTemplateModule {}
