import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateResistance } from '@keira-types/creature-template-resistance.type';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';
import { CREATURE_TEMPLATE_RESISTANCE_TABLE } from '@keira-types/creature-template-resistance.type';
import { SPELLSCHOOLRES } from '@keira-constants/options/spell-school-res';
import { MultiRowEditorComponent } from '@keira-shared/abstract/components/editors/multi-row-editor.component';

@Component({
  selector: 'keira-creature-template-resistance',
  templateUrl: './creature-template-resistance.component.html',
  styleUrls: ['./creature-template-resistance.component.scss']
})
export class CreatureTemplateResistanceComponent extends MultiRowEditorComponent<CreatureTemplateResistance> {

  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_RESISTANCE_TABLE;
  }

  public readonly SPELLSCHOOLRES = SPELLSCHOOLRES;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateResistanceService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
