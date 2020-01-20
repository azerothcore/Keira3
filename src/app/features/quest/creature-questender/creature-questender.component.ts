import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../../shared/abstract/components/editors/multi-row-editor.component';
import { QuestHandlerService } from '../quest-handler.service';
import { CreatureQuestenderService } from '../creature-questender.service';
import { CreatureQuestender } from '../../../shared/types/creature-questender.type';

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
