import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistance } from '@keira-types/creature-template-resistance.type';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';
import { CREATURE_TEMPLATE_RESISTANCE_TABLE } from '@keira-types/creature-template-resistance.type';
import { MultiRowEditorComponent } from '@keira-shared/abstract/components/editors/multi-row-editor.component';
import { CREATURE_TEMPLATE_RESISTANCE_SCHOOL } from '@keira-constants/options/creature-template-resistance-school';

@Component({
  selector: 'keira-creature-template-resistance',
  templateUrl: './creature-template-resistance.component.html',
})
export class CreatureTemplateResistanceComponent extends MultiRowEditorComponent<CreatureTemplateResistance> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_RESISTANCE_TABLE;
  }

  public readonly CREATURE_TEMPLATE_RESISTANCE_SCHOOL = CREATURE_TEMPLATE_RESISTANCE_SCHOOL;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureTemplateResistanceService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
