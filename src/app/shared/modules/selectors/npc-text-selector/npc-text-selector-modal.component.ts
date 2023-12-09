import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { NPC_TEXT_ID } from '@keira-shared/types/npc-text.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-npc-text-selector-modal',
  templateUrl: './npc-text-selector-modal.component.html',
  styleUrls: ['./npc-text-selector-modal.component.scss'],
})
export class NpcTextSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: NpcTextSearchService) {
    super(NPC_TEXT_ID, bsModalRef);
  }
}
