import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SaiEditorComponent } from '@keira/shared/core';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCreatureEditorService } from './sai-creature-editor.service';
import { TimedActionlistComponent } from '@keira/shared/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { EditorButtonsComponent } from '@keira/shared/core';
import { FlagsSelectorBtnComponent } from '@keira/shared/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QueryOutputComponent } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { SaiTopBarComponent } from '@keira/shared/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-sai-creature',
  templateUrl: '../../../../../libs/shared/core/src/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../../../libs/shared/core/src/modules/sai-editor/sai-editor.component.scss'],
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
export class SaiCreatureComponent extends SaiEditorComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: SaiCreatureEditorService,
    protected handlerService: SaiCreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
