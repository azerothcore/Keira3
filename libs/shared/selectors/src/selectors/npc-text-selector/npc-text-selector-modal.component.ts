import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { NPC_TEXT_ID, NpcText } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-text-selector-modal',
  templateUrl: './npc-text-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class NpcTextSelectorModalComponent extends SearchSelectorModalComponent<NpcText> {
  protected entityIdField = NPC_TEXT_ID;
  protected searchService = inject(NpcTextSearchService);
}
