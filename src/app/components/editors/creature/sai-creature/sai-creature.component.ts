import { Component } from '@angular/core';

import { SaiEditorComponent } from '../../shared/sai-editor/sai-editor.component';
import { SaiCreatureHandlerService } from '../../../../services/handlers/sai-creature-handler.service';
import { SaiCreatureEditorService } from '../../../../services/editors/creature/sai-creature-editor.service';

@Component({
  selector: 'app-sai-creature',
  templateUrl: '../../shared/sai-editor/sai-editor.component.html',
  styleUrls: ['../../shared/sai-editor/sai-editor.component.scss']
})
export class SaiCreatureComponent extends SaiEditorComponent {
  constructor(
    public editorService: SaiCreatureEditorService,
    protected handlerService: SaiCreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

