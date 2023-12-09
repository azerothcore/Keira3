import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { EMOTE } from '@keira-constants/options/emote';
import { QuestOfferReward } from '@keira-types/quest-offer-reward.type';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestOfferRewardService } from './quest-offer-reward.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-quest-offer-reward',
  templateUrl: './quest-offer-reward.component.html',
  styleUrls: ['./quest-offer-reward.component.scss'],
})
export class QuestOfferRewardComponent extends SingleRowEditorComponent<QuestOfferReward> {
  readonly EMOTE = EMOTE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestOfferRewardService,
    public handlerService: QuestHandlerService,
    readonly questPreviewService: QuestPreviewService,
  ) {
    super(editorService, handlerService);
  }
}
