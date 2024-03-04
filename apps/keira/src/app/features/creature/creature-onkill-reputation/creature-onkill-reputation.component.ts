import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira/core';
import { CreatureOnkillReputation, FACTION_RANK } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss'],
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {
  readonly FACTION_RANK = FACTION_RANK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureOnkillReputationService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
