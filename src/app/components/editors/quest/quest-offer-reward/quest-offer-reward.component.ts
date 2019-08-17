import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { QuestOfferReward } from '../../../../types/quest-offer-reward.type';
import { QuestOfferRewardService } from '../../../../services/editors/quest/quest-offer-reward.service';
import { QuestHandlerService } from '../../../../services/handlers/quest-handler.service';
import { EMOTE } from '../../../../constants/options/emote';

@Component({
  selector: 'app-quest-offer-reward',
  templateUrl: './quest-offer-reward.component.html',
  styleUrls: ['./quest-offer-reward.component.scss']
})
export class QuestOfferRewardComponent extends SingleRowEditorComponent<QuestOfferReward> {

  public readonly EMOTE = EMOTE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: QuestOfferRewardService,
    public handlerService: QuestHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
