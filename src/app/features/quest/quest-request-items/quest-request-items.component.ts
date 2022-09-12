import { Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { EMOTE } from '@keira-constants/options/emote';
import { QuestRequestItems } from '@keira-types/quest-request-items.type';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestRequestItemsService } from './quest-request-items.service';

@Component({
  selector: 'keira-quest-request-items',
  templateUrl: './quest-request-items.component.html',
  styleUrls: ['./quest-request-items.component.scss'],
})
export class QuestRequestItemsComponent extends SingleRowEditorComponent<QuestRequestItems> {
  readonly EMOTE = EMOTE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestRequestItemsService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
