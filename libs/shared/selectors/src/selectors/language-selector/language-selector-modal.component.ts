import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Language, LANGUAGE_ID } from '@keira/shared/acore-world-model';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LanguageSearchService } from '../../search/language-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-language-selector-modal',
  templateUrl: './language-selector-modal.component.html',
  styleUrls: ['./language-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class LanguageSelectorModalComponent extends SearchSelectorModalComponent<Language> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: LanguageSearchService,
  ) {
    super(LANGUAGE_ID, bsModalRef, searchService);
  }
}
