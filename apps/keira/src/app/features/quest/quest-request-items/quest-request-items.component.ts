import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/core';
import { EMOTE, QuestRequestItems } from '@keira/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestRequestItemsService } from './quest-request-items.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
