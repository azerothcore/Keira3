import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { GameobjectQuestitem } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectQuestitemService } from './gameobject-questitem.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { ItemSelectorBtnComponent } from '@keira/shared/selectors';
import { IconComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { TopBarComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-questitem',
  templateUrl: './gameobject-questitem.component.html',
  styleUrls: ['./gameobject-questitem.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    IconComponent,
    ItemSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    AsyncPipe,
  ],
})
export class GameobjectQuestitemComponent extends MultiRowEditorComponent<GameobjectQuestitem> {
  readonly editorService = inject(GameobjectQuestitemService);
  readonly handlerService = inject(GameobjectHandlerService);
}
