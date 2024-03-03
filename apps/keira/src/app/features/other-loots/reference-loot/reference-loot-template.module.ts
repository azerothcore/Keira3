import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule, HighlightjsWrapperModule, LootEditorModule, TopBarModule } from '@keira/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateComponent } from './reference-loot-template.component';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { TranslateModule } from '@ngx-translate/core';

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
    HighlightjsWrapperModule,
    NgxDatatableModule,
    TranslateModule,
  ],
  providers: [ReferenceLootTemplateService, SelectReferenceLootService, ReferenceLootHandlerService],
})
export class ReferenceLootTemplateModule {}
