import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Holiday, HOLIDAY_ID } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { HolidaySearchService } from '../../search/holiday-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-holiday-selector-modal',
  templateUrl: './holiday-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class HolidaySelectorModalComponent extends SearchSelectorModalComponent<Holiday> {
  protected entityIdField = HOLIDAY_ID;
  protected searchService = HolidaySearchService;
}
