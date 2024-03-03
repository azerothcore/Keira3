import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CreatureSearchService } from '../../search/creature-search.service';
import { CREATURE_TEMPLATE_ID, CreatureTemplate } from '@keira/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-selector-modal',
  templateUrl: './creature-selector-modal.component.html',
  styleUrls: ['./creature-selector-modal.component.scss'],
})
export class CreatureSelectorModalComponent extends SearchSelectorModalComponent<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: CreatureSearchService,
  ) {
    super(CREATURE_TEMPLATE_ID, bsModalRef, searchService);
  }
}
