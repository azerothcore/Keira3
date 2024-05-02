import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import {
  SPELL_DBC_CUSTOM_STARTING_ID,
  SPELL_DBC_DESCRIPTION,
  SPELL_DBC_ID,
  SPELL_DBC_NAME,
  SPELL_DBC_NAMESUBTEXT,
  SPELL_DBC_TABLE,
  SpellDbc,
} from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';
import { SelectSpellService } from './select-spell.service';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { CreateComponent, HighlightjsWrapperComponent, IconComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-spell.component.html',
  standalone: true,
  imports: [
    TopBarComponent,
    CreateComponent,
    TranslateModule,
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    IconComponent,
  ],
})
export class SelectSpellComponent extends SelectComponent<SpellDbc> {
  readonly SPELL_DBC_ID = SPELL_DBC_ID;
  readonly SPELL_DBC_NAME = SPELL_DBC_NAME;
  readonly SPELL_DBC_NAMESUBTEXT = SPELL_DBC_NAMESUBTEXT;
  readonly SPELL_DBC_DESCRIPTION = SPELL_DBC_DESCRIPTION;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly selectService: SelectSpellService,
    public readonly handlerService: SpellHandlerService,
  ) {
    super(SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_CUSTOM_STARTING_ID, selectService, handlerService);
  }
}
