import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QUEST_LOCALE, CreatureTextLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTextLocaleService } from './creature-text-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-text-locale',
  templateUrl: './creature-text-locale.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
    GenericOptionSelectorComponent,
  ],
})
export class CreatureTextLocaleComponent extends MultiRowEditorComponent<CreatureTextLocale> {
  protected override readonly editorService = inject(CreatureTextLocaleService);
  readonly handlerService = inject(CreatureHandlerService);
  /** (the locales the core reads: deDE, esES…) */
  protected readonly LOCALES = QUEST_LOCALE;
}
