import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GAME_TELE_ID, GameTele } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameTeleSearchService } from '../../search/game-tele-search.service';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-tele-selector-modal',
  templateUrl: './game-tele-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, HighlightjsWrapperComponent],
})
export class GameTeleSelectorModalComponent extends SearchSelectorModalComponent<GameTele> {
  protected entityIdField = GAME_TELE_ID;
  protected searchService = inject(GameTeleSearchService);
}
