import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Spell, SPELL_ID } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SpellSearchService } from '../../search/spell-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent, IconComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-selector-modal',
  templateUrl: './spell-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule, IconComponent],
})
export class SpellSelectorModalComponent extends SearchSelectorModalComponent<Spell> {
  protected entityIdField = SPELL_ID;
  protected searchService = inject(SpellSearchService);
}
