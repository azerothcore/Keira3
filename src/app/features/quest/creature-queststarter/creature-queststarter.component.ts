import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../../shared/abstract/components/editors/multi-row-editor.component';
import { QuestHandlerService } from '../quest-handler.service';
import { CreatureQueststarterService } from '../creature-queststarter.service';
import { CreatureQueststarter } from '../../../shared/types/creature-queststarter.type';

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
