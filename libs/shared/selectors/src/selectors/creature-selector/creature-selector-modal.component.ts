import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { CREATURE_TEMPLATE_ID, CreatureTemplate } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureSearchService } from '../../search/creature-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-selector-modal',
  templateUrl: './creature-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class CreatureSelectorModalComponent extends SearchSelectorModalComponent<CreatureTemplate> {
  protected entityIdField = CREATURE_TEMPLATE_ID;
  protected searchService = inject(CreatureSearchService);
}
