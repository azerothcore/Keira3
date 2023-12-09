import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AREA_ID } from '@keira-types/area.type';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AreaSearchService } from '../../search/area-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-area-selector-modal',
  templateUrl: './area-selector-modal.component.html',
  styleUrls: ['./area-selector-modal.component.scss'],
})
export class AreaSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: AreaSearchService) {
    super(AREA_ID, bsModalRef);
  }
}
