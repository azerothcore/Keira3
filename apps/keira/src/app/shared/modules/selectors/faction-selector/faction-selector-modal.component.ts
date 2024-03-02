import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { Faction, FACTION_ID } from '@keira/acore-world-model';
import { FactionSearchService } from '../../search/faction-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-faction-selector-modal',
  templateUrl: './faction-selector-modal.component.html',
})
export class FactionSelectorModalComponent extends SearchSelectorModalComponent<Faction> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: FactionSearchService,
  ) {
    super(FACTION_ID, bsModalRef, searchService);
  }
}
