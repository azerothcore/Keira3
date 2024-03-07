import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SpellSearchService } from '../../search/spell-search.service';
import { Spell, SPELL_ID } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '../../highlightjs-wrapper/highlightjs-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-selector-modal',
  templateUrl: './spell-selector-modal.component.html',
  styleUrls: ['./spell-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgIf, NgxDatatableModule, TranslateModule],
})
export class SpellSelectorModalComponent extends SearchSelectorModalComponent<Spell> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: SpellSearchService,
  ) {
    super(SPELL_ID, bsModalRef, searchService);
  }
}
