import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameTele } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameTeleService } from './game-tele.service';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions',
  templateUrl: './game-tele.component.html',
  styleUrls: ['./game-tele.component.scss'],
  standalone: true,
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, TooltipModule, QueryOutputComponent],
})
export class GameTeleComponent extends SingleRowEditorComponent<GameTele> {
  override readonly editorService = inject(GameTeleService);
  readonly handlerService = inject(GameTeleHandlerService);
}
