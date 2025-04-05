import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  MAIL_LOOT_TEMPLATE_TABLE,
  MailLootTemplate,
} from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../select-loot.component.html',
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
  ],
})
export class SelectMailLootComponent extends SelectComponent<MailLootTemplate> {
  readonly entityTable = MAIL_LOOT_TEMPLATE_TABLE;
  readonly entityIdField = LOOT_TEMPLATE_ID;
  readonly customStartingId = MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectMailLootService);
  readonly handlerService = inject(MailLootHandlerService);
}
