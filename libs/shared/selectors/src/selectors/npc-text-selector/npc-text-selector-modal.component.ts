import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { NpcTextSearchService } from '../../search/npc-text-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { NPC_TEXT_ID, NpcText } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-text-selector-modal',
  templateUrl: './npc-text-selector-modal.component.html',
  styleUrls: ['./npc-text-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class NpcTextSelectorModalComponent extends SearchSelectorModalComponent<NpcText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: NpcTextSearchService,
  ) {
    super(NPC_TEXT_ID, bsModalRef, searchService);
  }
}
