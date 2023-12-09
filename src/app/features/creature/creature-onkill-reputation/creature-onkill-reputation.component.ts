import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { CreatureOnkillReputation } from '@keira-types/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss'],
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {
  readonly FACTION_RANK = FACTION_RANK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureOnkillReputationService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
