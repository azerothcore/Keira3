import { Component } from '@angular/core';

import { SaiEditorComponent } from '@keira-shared/modules/sai-editor/sai-editor.component';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCreatureEditorService } from './sai-creature-editor.service';

@Component({
  selector: 'app-sai-creature',
  templateUrl: '../../../shared/modules/sai-editor/sai-editor.component.html',
  styleUrls: ['../../../shared/modules/sai-editor/sai-editor.component.scss']
})
export class SaiCreatureComponent extends SaiEditorComponent {
  constructor(
    public editorService: SaiCreatureEditorService,
    protected handlerService: SaiCreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

