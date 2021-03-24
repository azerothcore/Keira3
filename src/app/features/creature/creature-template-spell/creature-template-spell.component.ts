import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateSpell } from '@keira-types/creature-template-spell.type';
import { CreatureTemplateSpellService } from './creature-template-spell.service';
import { CREATURE_TEMPLATE_SPELL_TABLE } from '@keira-types/creature-template-spell.type';
import { MultiRowEditorComponent } from '@keira-shared/abstract/components/editors/multi-row-editor.component';

@Component({
  selector: 'keira-creature-template-spell',
  templateUrl: './creature-template-spell.component.html',
})
export class CreatureTemplateSpellComponent extends MultiRowEditorComponent<CreatureTemplateSpell> {

  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_SPELL_TABLE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureTemplateSpellService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
