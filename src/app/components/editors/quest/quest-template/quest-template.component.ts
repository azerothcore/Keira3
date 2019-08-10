import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestTemplate } from '../../../../types/quest-template.type';
import { QuestTemplateService } from '../../../../services/editors/quest/quest-template.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

@Component({
  selector: 'app-quest-template',
  templateUrl: './quest-template.component.html',
  styleUrls: ['./quest-template.component.scss']
})
export class QuestTemplateComponent extends SingleRowEditorComponent<QuestTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
