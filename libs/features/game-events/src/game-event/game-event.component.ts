import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GameEvent } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { HolidaySelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventService } from './game-event.service';

/** Minutes as days, hours and minutes: `1d 2h 30m`. */
export function minutesText(value: number | string | null): string {
  const total = Math.max(0, Math.trunc(Number(value) || 0));
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const minutes = total % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', minutes || !total ? `${minutes}m` : ''].filter(Boolean).join(' ');
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event',
  templateUrl: './game-event.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    ReactiveFormsModule,
    TooltipDirective,
    QueryOutputComponent,
    HolidaySelectorBtnComponent,
  ],
})
export class GameEventComponent extends SingleRowEditorComponent<GameEvent> {
  protected override readonly editorService = inject(GameEventService);
  protected readonly handlerService = inject(GameEventHandlerService);
  protected readonly minutesText = minutesText;
}
