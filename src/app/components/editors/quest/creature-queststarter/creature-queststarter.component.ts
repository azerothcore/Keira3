import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { CreatureQueststarterService } from '../../../../services/editors/quest/creature-queststarter.service';
import { CreatureQueststarter } from '../../../../types/creature-queststarter.type';

@Component({
  selector: 'app-creature-queststarter',
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
