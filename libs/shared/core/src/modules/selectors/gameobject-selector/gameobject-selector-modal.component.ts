import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { GameobjectSearchService } from '../../search/gameobject-search.service';
import { GAMEOBJECT_TEMPLATE_ID, GameobjectTemplate } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-selector-modal',
  templateUrl: './gameobject-selector-modal.component.html',
  styleUrls: ['./gameobject-selector-modal.component.scss'],
})
export class GameobjectSelectorModalComponent extends SearchSelectorModalComponent<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: GameobjectSearchService,
  ) {
    super(GAMEOBJECT_TEMPLATE_ID, bsModalRef, searchService);
  }
}
