import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MysqlQueryService, SelectComponent } from '@keira/shared/core';
import {
  LOOT_TEMPLATE_ID,
  SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  SPELL_LOOT_TEMPLATE_TABLE,
  SpellLootTemplate,
} from '@keira/shared/acore-world-model';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from '@keira/shared/core';
import { TopBarComponent } from '@keira/shared/core';

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
export class SelectSpellLootComponent extends SelectComponent<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectSpellLootService,
    public handlerService: SpellLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}
