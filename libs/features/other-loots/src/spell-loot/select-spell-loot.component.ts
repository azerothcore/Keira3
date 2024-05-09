import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  SPELL_LOOT_TEMPLATE_TABLE,
  SpellLootTemplate,
} from '@keira/shared/acore-world-model';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../select-loot.component.html',
  standalone: true,
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
export class SelectSpellLootComponent extends SelectComponent<SpellLootTemplate> {
  readonly entityTable = SPELL_LOOT_TEMPLATE_TABLE;
  readonly entityIdField = LOOT_TEMPLATE_ID;
  readonly customStartingId = SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID;
  readonly selectService = inject(SelectSpellLootService);
  readonly handlerService = inject(SpellLootHandlerService);
}
