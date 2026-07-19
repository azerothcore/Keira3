import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Map, MAP_ID } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { MapSearchService } from '../../search/map-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-map-selector-modal',
  templateUrl: './map-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class MapSelectorModalComponent extends SearchSelectorModalComponent<Map> {
  protected entityIdField = MAP_ID;
  protected searchService = inject(MapSearchService);
}
