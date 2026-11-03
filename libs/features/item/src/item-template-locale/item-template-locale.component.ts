import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QUEST_LOCALE, ItemTemplateLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { GenericOptionSelectorComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemHandlerService } from '../item-handler.service';
import { ItemTemplateLocaleService } from './item-template-locale.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-template-locale',
  templateUrl: './item-template-locale.component.html',
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
export class ItemTemplateLocaleComponent extends MultiRowEditorComponent<ItemTemplateLocale> {
  protected override readonly editorService = inject(ItemTemplateLocaleService);
  readonly handlerService = inject(ItemHandlerService);
  /** (the locales the core reads: deDE, esES…) */
  protected readonly LOCALES = QUEST_LOCALE;
}
