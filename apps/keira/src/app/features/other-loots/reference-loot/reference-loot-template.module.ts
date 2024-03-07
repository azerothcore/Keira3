import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LootEditorModule } from '@keira/shared/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateComponent } from './reference-loot-template.component';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { SelectReferenceLootComponent } from './select-reference-loot.component';
import { SelectReferenceLootService } from './select-reference-loot.service';
import { TranslateModule } from '@ngx-translate/core';

const components = [ReferenceLootTemplateComponent, SelectReferenceLootComponent];

@NgModule({
  exports: components,
  imports: [CommonModule, LootEditorModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, ...components],
  providers: [ReferenceLootTemplateService, SelectReferenceLootService, ReferenceLootHandlerService],
})
export class ReferenceLootTemplateModule {}
