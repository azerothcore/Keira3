import { Component } from '@angular/core';

import { CreatureTemplateService } from '../../../../services/editors/creature/creature-template.service';
import { CreatureTemplate } from './creature-template.type';
import { SingleRowEditorComponent } from '../../single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';

@Component({
  selector: 'app-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss']
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {

  constructor(
    public editorService: CreatureTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
