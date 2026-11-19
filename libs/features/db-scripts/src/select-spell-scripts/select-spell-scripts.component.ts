import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SPELL_SCRIPTS_ID, SPELL_SCRIPTS_TABLE, SpellScripts } from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SpellScriptsHandlerService } from '../spell-scripts-handler.service';
import { SelectSpellScriptsService } from './select-spell-scripts.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-spell-scripts',
  templateUrl: './select-spell-scripts.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectSpellScriptsComponent extends SelectComponent<SpellScripts> {
  protected override readonly entityTable = SPELL_SCRIPTS_TABLE;
  protected override readonly entityIdField = SPELL_SCRIPTS_ID;
  readonly customStartingId = 1;
  protected readonly selectService = inject(SelectSpellScriptsService);
  readonly handlerService = inject(SpellScriptsHandlerService);
}
