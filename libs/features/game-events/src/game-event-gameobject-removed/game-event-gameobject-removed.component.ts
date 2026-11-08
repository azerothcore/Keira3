import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventGameobject } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventGameobjectRemovedService } from './game-event-gameobject-removed.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-gameobject-removed',
  templateUrl: './game-event-gameobject-removed.component.html',
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
export class GameEventGameobjectRemovedComponent extends MultiRowEditorComponent<GameEventGameobject> {
  protected override readonly editorService = inject(GameEventGameobjectRemovedService);
  readonly handlerService = inject(GameEventHandlerService);
}
