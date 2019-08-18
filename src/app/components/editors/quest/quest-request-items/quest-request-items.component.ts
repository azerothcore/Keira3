import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestRequestItems } from '../../../../types/quest-request-items.type';
import { QuestRequestItemsService } from '../../../../services/editors/quest/quest-request-items.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { EMOTE } from '../../../../constants/options/emote';

@Component({
  selector: 'app-quest-request-items',
  templateUrl: './quest-request-items.component.html',
  styleUrls: ['./quest-request-items.component.scss']
})
export class QuestRequestItemsComponent extends SingleRowEditorComponent<QuestRequestItems> {

  public readonly EMOTE = EMOTE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestRequestItemsService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
