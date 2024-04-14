import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  MAIL_LOOT_TEMPLATE_TABLE,
  MailLootTemplate,
} from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/base-editor-components';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
  templateUrl: '../select-loot.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgIf,
    NgxDatatableModule,
  ],
})
export class SelectMailLootComponent extends SelectComponent<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectMailLootService,
    public readonly handlerService: MailLootHandlerService,
  ) {
    super(MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
