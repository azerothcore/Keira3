import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SOUND_ENTRIES_ID, SoundEntries } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { SoundEntriesSearchService } from '../../search/sound-entries-search.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sound-entries-selector-modal',
  templateUrl: './sound-entries-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class SoundEntriesSelectorModalComponent extends SearchSelectorModalComponent<SoundEntries> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: SoundEntriesSearchService,
  ) {
    super(SOUND_ENTRIES_ID, bsModalRef, searchService);
  }
}
