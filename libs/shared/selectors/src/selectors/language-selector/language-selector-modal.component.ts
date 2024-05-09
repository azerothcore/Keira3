import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LANGUAGE_ID, Language } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { LanguageSearchService } from '../../search/language-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-language-selector-modal',
  templateUrl: './language-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class LanguageSelectorModalComponent extends SearchSelectorModalComponent<Language> {
  protected entityIdField = LANGUAGE_ID;
  protected searchService = inject(LanguageSearchService);
}
