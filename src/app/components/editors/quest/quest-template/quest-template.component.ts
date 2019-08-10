import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestTemplate } from '../../../../types/quest-template.type';
import { QuestTemplateService } from '../../../../services/editors/quest/quest-template.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { ALLOWABLE_RACES } from '../../../../constants/flags/allowable-races';
import { FACTIONS } from '../../../../constants/options/faction';
import { QUEST_FLAGS } from '../../../../constants/flags/quest-flags';
import { QUEST_TYPE } from '../../../../constants/options/quest-type';

@Component({
  selector: 'app-quest-template',
  templateUrl: './quest-template.component.html',
  styleUrls: ['./quest-template.component.scss']
})
export class QuestTemplateComponent extends SingleRowEditorComponent<QuestTemplate> {

  public readonly FACTIONS = FACTIONS;
  public readonly QUEST_FLAGS = QUEST_FLAGS;
  public readonly QUEST_TYPE = QUEST_TYPE;
  public readonly ALLOWABLE_RACES = ALLOWABLE_RACES;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
