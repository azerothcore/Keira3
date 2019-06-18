import { Component } from '@angular/core';

import { CreatureTemplateService } from '../../../../services/editors/creature/creature-template.service';
import { CreatureTemplate } from '../../../../types/creature-template.type';
import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { UNIT_FLAGS_2 } from '../../../../constants/flags/unit-flags2';

@Component({
  selector: 'app-creature-template',
  templateUrl: './creature-template.component.html',
  styleUrls: ['./creature-template.component.scss']
})
export class CreatureTemplateComponent extends SingleRowEditorComponent<CreatureTemplate> {

  public readonly UNIT_FLAGS_2 = UNIT_FLAGS_2;

  constructor(
    public editorService: CreatureTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
