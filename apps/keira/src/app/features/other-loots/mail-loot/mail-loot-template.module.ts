import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateModule, HighlightjsWrapperModule, LootEditorModule, TopBarModule } from '@keira/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MailLootTemplateComponent } from './mail-loot-template.component';
import { MailLootTemplateService } from './mail-loot-template.service';
import { SelectMailLootComponent } from './select-mail-loot.component';
import { SelectMailLootService } from './select-mail-loot.service';
import { TranslateModule } from '@ngx-translate/core';

const components = [MailLootTemplateComponent, SelectMailLootComponent];

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
  providers: [MailLootTemplateService, SelectMailLootService, MailLootHandlerService],
})
export class MailLootTemplateModule {}
