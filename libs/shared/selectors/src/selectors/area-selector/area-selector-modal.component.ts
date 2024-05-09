import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AREA_ID, Area } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { AreaSearchService } from '../../search/area-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-area-selector-modal',
  templateUrl: './area-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class AreaSelectorModalComponent extends SearchSelectorModalComponent<Area> {
  protected entityIdField = AREA_ID;
  protected searchService = inject(AreaSearchService);
}
