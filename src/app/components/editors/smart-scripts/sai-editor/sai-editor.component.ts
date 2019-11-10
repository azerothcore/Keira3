import { Component } from '@angular/core';

import { SaiHandlerService } from '../../../../services/handlers/sai-handler.service';
import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { SmartScripts } from '../../../../types/smart-scripts.type';
import { SaiEditorService } from '../../../../services/editors/sai/sai-editor.service';

@Component({
  selector: 'app-sai-editor',
  templateUrl: './sai-editor.component.html',
  styleUrls: ['./sai-editor.component.scss']
})
export class SaiEditorComponent extends MultiRowEditorComponent<SmartScripts> {

  constructor(
    public editorService: SaiEditorService,
    protected handlerService: SaiHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

