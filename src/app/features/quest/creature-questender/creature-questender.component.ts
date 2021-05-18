import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { QuestHandlerService } from '../quest-handler.service';
import { CreatureQuestenderService } from './creature-questender.service';
import { CreatureQuestender } from '@keira-types/creature-questender.type';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';

@Component({
  selector: 'keira-creature-questender',
  templateUrl: './creature-questender.component.html',
  styleUrls: ['./creature-questender.component.scss'],
})
export class CreatureQuestenderComponent extends MultiRowEditorComponent<CreatureQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQuestenderService,
    public handlerService: QuestHandlerService,
    public readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
