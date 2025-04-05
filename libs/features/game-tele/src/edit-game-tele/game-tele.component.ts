import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameTele } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { GameTeleService } from './game-tele.service';
import { GameTeleHandlerService } from '../game-tele-handler.service';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { MapSelectorBtnComponent } from '@keira/shared/selectors';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-conditions',
  templateUrl: './game-tele.component.html',
  imports: [TranslateModule, FormsModule, ReactiveFormsModule, TooltipModule, QueryOutputComponent, MapSelectorBtnComponent],
})
export class GameTeleComponent extends SingleRowEditorComponent<GameTele> {
  protected override readonly editorService = inject(GameTeleService);
  protected readonly handlerService = inject(GameTeleHandlerService);
}
