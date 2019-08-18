import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { CreatureSearchService } from '../../../../../services/search/creature-search.service';
import { CREATURE_TEMPLATE_ID } from '../../../../../types/creature-template.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'app-creature-selector-modal',
  templateUrl: './creature-selector-modal.component.html',
  styleUrls: ['./creature-selector-modal.component.scss']
})
export class CreatureSelectorModalComponent extends SearchSelectorModalComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: CreatureSearchService,
  ) {
    super(CREATURE_TEMPLATE_ID, bsModalRef);
  }
}
