import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GameEventPool } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { GameEventHandlerService } from '../game-event-handler.service';
import { GameEventPoolRemovedService } from './game-event-pool-removed.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-game-event-pool-removed',
  templateUrl: './game-event-pool-removed.component.html',
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
export class GameEventRemovedPoolsComponent extends MultiRowEditorComponent<GameEventPool> {
  protected override readonly editorService = inject(GameEventPoolRemovedService);
  readonly handlerService = inject(GameEventHandlerService);
}
