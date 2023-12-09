import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { QuestSearchService } from '../../search/quest-search.service';
import { QUEST_TEMPLATE_ID } from '@keira-types/quest-template.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-quest-selector-modal',
  templateUrl: './quest-selector-modal.component.html',
  styleUrls: ['./quest-selector-modal.component.scss'],
})
export class QuestSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: QuestSearchService) {
    super(QUEST_TEMPLATE_ID, bsModalRef);
  }
}
