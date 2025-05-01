import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Faction, FACTION_SEARCH_FIELDS } from '@keira/shared/acore-world-model';
import { FactionSearchService } from '../../search/faction-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-faction-selector-modal',
  templateUrl: './faction-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class QuestFactionSelectorModalComponent extends SearchSelectorModalComponent<Faction> {
  protected entityIdField = FACTION_SEARCH_FIELDS[1];
  protected searchService = inject(FactionSearchService);
}
