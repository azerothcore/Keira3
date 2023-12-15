import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { CreatureSearchService } from '../../search/creature-search.service';
import { CREATURE_TEMPLATE_ID } from '@keira-types/creature-template.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-creature-selector-modal',
  templateUrl: './creature-selector-modal.component.html',
  styleUrls: ['./creature-selector-modal.component.scss'],
})
export class CreatureSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: CreatureSearchService) {
    super(CREATURE_TEMPLATE_ID, bsModalRef);
  }
}
