import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { GameobjectSearchService } from '../../search/gameobject-search.service';
import { GAMEOBJECT_TEMPLATE_ID } from '@keira-types/gameobject-template.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'keira-gameobject-selector-modal',
  templateUrl: './gameobject-selector-modal.component.html',
  styleUrls: ['./gameobject-selector-modal.component.scss']
})
export class GameobjectSelectorModalComponent extends SearchSelectorModalComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: GameobjectSearchService,
  ) {
    super(GAMEOBJECT_TEMPLATE_ID, bsModalRef);
  }
}
