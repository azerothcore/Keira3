import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureEquipTemplateService } from './creature-equip-template.service';
import { CreatureEquipTemplate } from '@keira-types/creature-equip-template.type';

@Component({
  selector: 'keira-creature-equip-template',
  templateUrl: './creature-equip-template.component.html',
  styleUrls: ['./creature-equip-template.component.scss']
})
export class CreatureEquipTemplateComponent extends SingleRowEditorComponent<CreatureEquipTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureEquipTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
