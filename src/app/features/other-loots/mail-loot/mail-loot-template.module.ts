import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { MailLootTemplateComponent } from './mail-loot-template.component';
import { MailLootTemplateService } from './mail-loot-template.service';
import { LootEditorModule } from '@keira-shared/modules/loot-editor/loot-editor.module';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';
import { SelectMailLootComponent } from './select-mail-loot.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

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
    SearchButtonsModule,
    HighlightModule,
    NgxDatatableModule,
  ],
  providers: [MailLootTemplateService, SelectMailLootService, MailLootHandlerService],
})
export class MailLootTemplateModule {}
