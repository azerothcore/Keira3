import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LANGUAGE_ID } from '@keira-types/language.type';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { LanguageSearchService } from '../../search/language-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-language-selector-modal',
  templateUrl: './language-selector-modal.component.html',
  styleUrls: ['./language-selector-modal.component.scss'],
})
export class LanguageSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: LanguageSearchService) {
    super(LANGUAGE_ID, bsModalRef);
  }
}
