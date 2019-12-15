import { Component } from '@angular/core';
import { SaiEditorComponent } from '../../shared/sai-editor/sai-editor.component';
import { SaiEditorService } from '../../../../services/editors/sai/sai-editor.service';
import { SaiCreatureHandlerService } from '../../../../services/handlers/sai-creature-handler.service';

@Component({
  selector: 'app-creature-smartai',
  templateUrl: '../../shared/sai-editor/sai-editor.component.html',
  styleUrls: ['../../shared/sai-editor/sai-editor.component.scss']
})
export class CreatureSmartaiComponent extends SaiEditorComponent {
  constructor(
    public editorService: SaiEditorService,
    protected handlerService: SaiCreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

