import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/shared/sai-editor';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';
import { TimedActionlistComponent } from '@keira/shared/sai-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { SaiTopBarComponent } from '@keira/shared/sai-editor';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-gameobject',
  templateUrl: '../../../../../libs/shared/sai-editor/src/sai-editor.component.html',
  styleUrls: ['../../../../../libs/shared/sai-editor/src/sai-editor.component.scss'],
  standalone: true,
  imports: [
    SaiTopBarComponent,
    NgIf,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    TooltipModule,
    FlagsSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    TimedActionlistComponent,
  ],
})
export class SaiGameobjectComponent extends SaiEditorComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiGameobjectEditorService,
    protected handlerService: SaiGameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
