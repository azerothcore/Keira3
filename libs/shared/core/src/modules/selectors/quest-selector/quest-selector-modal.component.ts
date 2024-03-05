import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { QuestSearchService } from '../../search/quest-search.service';
import { QUEST_TEMPLATE_ID, QuestTemplate } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-selector-modal',
  templateUrl: './quest-selector-modal.component.html',
  styleUrls: ['./quest-selector-modal.component.scss'],
})
export class QuestSelectorModalComponent extends SearchSelectorModalComponent<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: QuestSearchService,
  ) {
    super(QUEST_TEMPLATE_ID, bsModalRef, searchService);
  }
}
