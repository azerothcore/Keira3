import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreatureQuestitem } from '@keira/shared/acore-world-model';
import { MultiRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { EditorButtonsComponent, IconComponent, QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { ItemSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureQuestitemService } from './creature-questitem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-questitem',
  templateUrl: './creature-questitem.component.html',
  styleUrls: ['./creature-questitem.component.scss'],
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
export class CreatureQuestitemComponent extends MultiRowEditorComponent<CreatureQuestitem> {
  override readonly editorService = inject(CreatureQuestitemService);
  readonly handlerService = inject(CreatureHandlerService);
}
