import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { QuestHandlerService } from '../quest-handler.service';
import { CreatureQueststarterService } from './creature-queststarter.service';
import { CreatureQueststarter } from '@keira-types/creature-queststarter.type';

@Component({
  selector: 'keira-creature-queststarter',
  templateUrl: './creature-queststarter.component.html',
  styleUrls: ['./creature-queststarter.component.scss']
})
export class CreatureQueststarterComponent extends MultiRowEditorComponent<CreatureQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQueststarterService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
