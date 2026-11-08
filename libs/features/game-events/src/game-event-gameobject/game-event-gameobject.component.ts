import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventGameobject } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventGameobjectService } from './game-event-gameobject.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-gameobject',
  templateUrl: './game-event-gameobject.component.html',
  imports: [
    TopBarComponent,
    TranslateDirective,
    TranslatePipe,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    EditorButtonsComponent,
    NgxDatatableModule,
  ],
})
export class GameEventGameobjectComponent extends MultiRowEditorComponent<GameEventGameobject> {
  protected override readonly editorService = inject(GameEventGameobjectService);
  readonly handlerService = inject(GameEventHandlerService);
}
