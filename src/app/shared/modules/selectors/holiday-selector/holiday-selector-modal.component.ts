import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { HolidaySearchService } from '../../search/holiday-search.service';
import { Holiday, HOLIDAY_ID } from '@keira-types/holiday.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-holiday-selector-modal',
  templateUrl: './holiday-selector-modal.component.html',
  styleUrls: ['./holiday-selector-modal.component.scss'],
})
export class HolidaySelectorModalComponent extends SearchSelectorModalComponent<Holiday> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: HolidaySearchService) {
    super(HOLIDAY_ID, bsModalRef, searchService);
  }
}
