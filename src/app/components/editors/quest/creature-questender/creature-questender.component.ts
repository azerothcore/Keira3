import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { CreatureQuestenderService } from '../../../../services/editors/quest/creature-questender.service';
import { CreatureQuestender } from '../../../../types/creature-questender.type';

@Component({
  selector: 'app-creature-questender',
  templateUrl: './creature-questender.component.html',
  styleUrls: ['./creature-questender.component.scss']
})
export class CreatureQuestenderComponent extends MultiRowEditorComponent<CreatureQuestender> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQuestenderService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
