import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/shared/core';
import { ALLOWABLE_RACES, QUEST_FLAGS, QUEST_INFO, QUEST_TYPE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestTemplateService } from './quest-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-template',
  templateUrl: './quest-template.component.html',
  styleUrls: ['./quest-template.component.scss'],
})
export class QuestTemplateComponent extends SingleRowEditorComponent<QuestTemplate> {
  readonly QUEST_FLAGS = QUEST_FLAGS;
  readonly QUEST_TYPE = QUEST_TYPE;
  readonly ALLOWABLE_RACES = ALLOWABLE_RACES;
  readonly QUEST_INFO = QUEST_INFO;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
