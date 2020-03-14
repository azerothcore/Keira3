import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { QuestRequestItems } from '@keira-types/quest-request-items.type';
import { QuestRequestItemsService } from './quest-request-items.service';
import { QuestHandlerService } from '../quest-handler.service';
import { EMOTE } from '@keira-constants/options/emote';

@Component({
  selector: 'keira-quest-request-items',
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
