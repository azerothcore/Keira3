import { Component } from '@angular/core';

import { SaiEditorComponent } from '../../shared/sai-editor/sai-editor.component';
import { SaiGameobjectHandlerService } from '../../../../services/handlers/sai-gameobject-handler.service';
import { SaiGameobjectEditorService } from '../../../../services/editors/gameobject/sai-gameobject-editor.service';

@Component({
  selector: 'app-sai-gameobject',
  templateUrl: '../../shared/sai-editor/sai-editor.component.html',
  styleUrls: ['../../shared/sai-editor/sai-editor.component.scss']
})
export class SaiGameobjectComponent extends SaiEditorComponent {
  constructor(
    public editorService: SaiGameobjectEditorService,
    protected handlerService: SaiGameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

