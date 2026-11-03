import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QUEST_LOCALE, PageTextLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { PageTextHandlerService } from '../page-text/page-text-handler.service';
import { PageTextLocaleService } from './page-text-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-page-text-locale',
  templateUrl: './page-text-locale.component.html',
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
export class PageTextLocaleComponent extends MultiRowEditorComponent<PageTextLocale> {
  protected override readonly editorService = inject(PageTextLocaleService);
  readonly handlerService = inject(PageTextHandlerService);
  /** (the locales the core reads: deDE, esES…) */
  protected readonly LOCALES = QUEST_LOCALE;
}
