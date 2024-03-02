import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { SpellSearchService } from '../../search/spell-search.service';
import { Spell, SPELL_ID } from '@keira/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-selector-modal',
  templateUrl: './spell-selector-modal.component.html',
  styleUrls: ['./spell-selector-modal.component.scss'],
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
