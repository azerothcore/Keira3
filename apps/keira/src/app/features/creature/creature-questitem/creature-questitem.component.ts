import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { CreatureQuestitem } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureQuestitemService } from './creature-questitem.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { ItemSelectorBtnComponent } from '@keira/shared/core';
import { IconComponent } from '@keira/shared/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, AsyncPipe } from '@angular/common';
import { TopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-questitem',
  templateUrl: './creature-questitem.component.html',
  styleUrls: ['./creature-questitem.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    NgIf,
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQuestitemService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
