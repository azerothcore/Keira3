import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SaiEditorComponent } from '@keira/shared/sai-editor';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';
import { TimedActionlistComponent } from '@keira/shared/sai-editor';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/base-editor-components';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/base-editor-components';
import { TranslateModule } from '@ngx-translate/core';
import { SaiTopBarComponent } from '@keira/shared/sai-editor';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-gameobject',
  templateUrl: '../../../../../libs/shared/sai-editor/src/sai-editor.component.html',
  styleUrls: ['../../../../../libs/shared/sai-editor/src/sai-editor.component.scss'],
  standalone: true,
  imports: [
    SaiTopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    FlagsSelectorBtnComponent,
    EditorButtonsComponent,
    NgxDatatableModule,
    TimedActionlistComponent,
  ],
})
export class SaiGameobjectComponent extends SaiEditorComponent {
  readonly editorService = inject(SaiGameobjectEditorService);
  protected readonly handlerService = inject(SaiGameobjectHandlerService);
}
