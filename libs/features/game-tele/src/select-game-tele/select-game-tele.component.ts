import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { GAME_TELE_CUSTOM_STARTING_ID, GAME_TELE_ID, GAME_TELE_TABLE, GameTele } from '@keira/shared/acore-world-model';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { SelectGameTeleService } from './select-game-tele.service';
import { WIKI_BASE_URL } from '@keira/shared/constants';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { MapSelectorBtnComponent } from '@keira/shared/selectors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './select-game-tele.component.html',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
    MapSelectorBtnComponent,
  ],
})
export class SelectGameTeleComponent extends SelectComponent<GameTele> {
  protected readonly entityTable = GAME_TELE_TABLE;
  protected readonly entityIdField = GAME_TELE_ID;
  readonly customStartingId = GAME_TELE_CUSTOM_STARTING_ID;
  protected readonly selectService = inject(SelectGameTeleService);
  readonly handlerService = inject(GameTeleHandlerService);
  protected readonly WIKI_BASE_URL = WIKI_BASE_URL;
}
