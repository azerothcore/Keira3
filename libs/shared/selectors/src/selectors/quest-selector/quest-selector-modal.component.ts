import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { QUEST_TEMPLATE_ID, QuestTemplate } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { QuestSearchService } from '../../search/quest-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-selector-modal',
  templateUrl: './quest-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
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
