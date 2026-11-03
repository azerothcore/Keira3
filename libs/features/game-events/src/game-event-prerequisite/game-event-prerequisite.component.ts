import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventPrerequisite } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventPrerequisiteService } from './game-event-prerequisite.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-prerequisite',
  templateUrl: './game-event-prerequisite.component.html',
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
export class GameEventPrerequisiteComponent extends MultiRowEditorComponent<GameEventPrerequisite> {
  protected override readonly editorService = inject(GameEventPrerequisiteService);
  readonly handlerService = inject(GameEventHandlerService);
}
