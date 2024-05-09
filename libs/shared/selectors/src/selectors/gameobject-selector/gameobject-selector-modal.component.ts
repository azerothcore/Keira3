import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { GAMEOBJECT_TEMPLATE_ID, GameobjectTemplate } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameobjectSearchService } from '../../search/gameobject-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-selector-modal',
  templateUrl: './gameobject-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class GameobjectSelectorModalComponent extends SearchSelectorModalComponent<GameobjectTemplate> {
  protected entityIdField = GAMEOBJECT_TEMPLATE_ID;
  protected searchService = inject(GameobjectSearchService);
}
