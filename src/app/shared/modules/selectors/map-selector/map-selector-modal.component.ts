import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { MapSearchService } from '../../search/map-search.service';
import { MAP_ID } from '@keira-types/map.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'keira-map-selector-modal',
  templateUrl: './map-selector-modal.component.html',
  styleUrls: ['./map-selector-modal.component.scss']
})
export class MapSelectorModalComponent extends SearchSelectorModalComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: MapSearchService,
  ) {
    super(MAP_ID, bsModalRef);
  }
}
