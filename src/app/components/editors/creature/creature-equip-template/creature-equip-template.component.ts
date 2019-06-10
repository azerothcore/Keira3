import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureEquipTemplateService } from '../../../../services/editors/creature/creature-equip-template.service';
import { CreatureEquipTemplate } from './creature-equip-template.type';

@Component({
  selector: 'app-creature-equip-template',
  templateUrl: './creature-equip-template.component.html',
  styleUrls: ['./creature-equip-template.component.scss']
})
export class CreatureEquipTemplateComponent extends SingleRowEditorComponent<CreatureEquipTemplate> {

  constructor(
    public editorService: CreatureEquipTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
