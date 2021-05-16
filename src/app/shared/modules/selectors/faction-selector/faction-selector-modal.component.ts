import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FactionSearchService } from '../../search/faction-search.service';
import { FACTION_ID } from '@keira-types/faction.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'keira-faction-selector-modal',
  templateUrl: './faction-selector-modal.component.html',
  styleUrls: ['./faction-selector-modal.component.scss'],
})
export class FactionSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: FactionSearchService) {
    super(FACTION_ID, bsModalRef);
  }
}
