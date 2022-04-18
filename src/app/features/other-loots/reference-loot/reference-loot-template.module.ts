import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateComponent } from './reference-loot-template.component';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { SelectReferenceLootService } from './select-reference-loot.service';

const components = [ReferenceLootTemplateComponent, SelectReferenceLootComponent];

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
    HighlightjsWrapperModule,
    NgxDatatableModule,
  ],
  providers: [ReferenceLootTemplateService, SelectReferenceLootService, ReferenceLootHandlerService],
})
export class ReferenceLootTemplateModule {}
