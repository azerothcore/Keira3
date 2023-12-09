import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-shared/abstract/components/editors/multi-row-editor.component';
import { CreatureTemplateSpell, CREATURE_TEMPLATE_SPELL_TABLE } from '@keira-types/creature-template-spell.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureTemplateSpellService } from './creature-template-spell.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-creature-template-spell',
  templateUrl: './creature-template-spell.component.html',
})
export class CreatureTemplateSpellComponent extends MultiRowEditorComponent<CreatureTemplateSpell> {
  public get docUrl(): string {
    return this.WIKI_BASE_URL + CREATURE_TEMPLATE_SPELL_TABLE;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureTemplateSpellService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
