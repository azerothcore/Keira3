import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { FactionSearchService } from '../../search/faction-search.service';
import { Faction, FACTION_ID } from '@keira-types/faction.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-faction-selector-modal',
  templateUrl: './faction-selector-modal.component.html',
  styleUrls: ['./faction-selector-modal.component.scss'],
})
export class FactionSelectorModalComponent extends SearchSelectorModalComponent<Faction> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: FactionSearchService) {
    super(FACTION_ID, bsModalRef, searchService);
  }
}
