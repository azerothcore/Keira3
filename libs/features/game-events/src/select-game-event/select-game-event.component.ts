import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  GAME_EVENT_CUSTOM_STARTING_ID,
  GAME_EVENT_ID,
  GAME_EVENT_MAX_ID,
  GAME_EVENT_TABLE,
  GameEvent,
} from '@keira/shared/acore-world-model';
import { SelectComponent } from '@keira/shared/base-abstract-classes';
import { CreateComponent, HighlightjsWrapperComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { SelectGameEventService } from './select-game-event.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-game-event',
  templateUrl: './select-game-event.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslateDirective,
    TranslatePipe,
    NgxDatatableModule,
    CreateComponent,
    HighlightjsWrapperComponent,
    TopBarComponent,
  ],
})
export class SelectGameEventComponent extends SelectComponent<GameEvent> {
  protected override readonly entityTable = GAME_EVENT_TABLE;
  protected override readonly entityIdField = GAME_EVENT_ID;
  readonly customStartingId = GAME_EVENT_CUSTOM_STARTING_ID;
  protected readonly maxId = GAME_EVENT_MAX_ID;
  protected readonly selectService = inject(SelectGameEventService);
  readonly handlerService = inject(GameEventHandlerService);
}
