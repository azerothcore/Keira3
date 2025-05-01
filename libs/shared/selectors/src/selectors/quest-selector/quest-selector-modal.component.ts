import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

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
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class QuestSelectorModalComponent extends SearchSelectorModalComponent<QuestTemplate> {
  protected entityIdField = QUEST_TEMPLATE_ID;
  protected searchService = inject(QuestSearchService);
}
