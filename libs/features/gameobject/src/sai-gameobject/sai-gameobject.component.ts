import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EditorButtonsComponent, QueryOutputComponent } from '@keira/shared/base-editor-components';
import { SaiEditorComponent, SaiTopBarComponent, TimedActionlistComponent } from '@keira/shared/sai-editor';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from './sai-gameobject-editor.service';

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
  override readonly editorService = inject(SaiGameobjectEditorService);
  protected override readonly handlerService = inject(SaiGameobjectHandlerService);
}
