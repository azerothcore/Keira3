import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestTemplateAddon } from '../../../../types/quest-template-addon.type';
import { QuestTemplateAddonService } from '../../../../services/editors/quest/quest-template-addon.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';

@Component({
  selector: 'app-quest-template-addon',
  templateUrl: './quest-template-addon.component.html',
  styleUrls: ['./quest-template-addon.component.scss']
})
export class QuestTemplateAddonComponent extends SingleRowEditorComponent<QuestTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestTemplateAddonService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
