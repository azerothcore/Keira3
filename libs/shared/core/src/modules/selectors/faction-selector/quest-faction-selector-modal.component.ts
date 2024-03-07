import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { Faction, FACTION_SEARCH_FIELDS } from '@keira/shared/acore-world-model';
import { FactionSearchService } from '../../search/faction-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '../../highlightjs-wrapper/highlightjs-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-faction-selector-modal',
  templateUrl: './faction-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgIf, NgxDatatableModule, TranslateModule],
})
export class QuestFactionSelectorModalComponent extends SearchSelectorModalComponent<Faction> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: FactionSearchService,
  ) {
    super(FACTION_SEARCH_FIELDS[1], bsModalRef, searchService);
  }
}
