import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EMOTE, QuestOfferReward } from '@keira/shared/acore-world-model';
import { SingleRowEditorComponent } from '@keira/shared/base-abstract-classes';
import { QueryOutputComponent, TopBarComponent } from '@keira/shared/base-editor-components';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestPreviewComponent } from '../quest-preview/quest-preview.component';
import { QuestPreviewService } from '../quest-preview/quest-preview.service';
import { QuestOfferRewardService } from './quest-offer-reward.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-offer-reward',
  templateUrl: './quest-offer-reward.component.html',
  styleUrls: ['./quest-offer-reward.component.scss'],
  standalone: true,
  imports: [
    TopBarComponent,
    TranslateModule,
    QueryOutputComponent,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    SingleValueSelectorBtnComponent,
    QuestPreviewComponent,
  ],
})
export class QuestOfferRewardComponent extends SingleRowEditorComponent<QuestOfferReward> {
  readonly EMOTE = EMOTE;

  readonly editorService = inject(QuestOfferRewardService);
  readonly handlerService = inject(QuestHandlerService);
  readonly questPreviewService = inject(QuestPreviewService);
}
