import { Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { FACTION_RANK } from '@keira-constants/options/faction-rank';
import { CreatureOnkillReputation } from '@keira-types/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@Component({
  selector: 'keira-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss'],
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {
  public readonly FACTION_RANK = FACTION_RANK;

  public readonly TEAM_DEPENDENT_TOOLTIP =
    'Boolean value. 0 - Will give reputation to the any player from both fields ' +
    '(RewOnKillRepFaction1 and RewOnKillRepFaction2); 1 - Will give reputation to alliance players from RewOnKillRepFaction1 and ' +
    'horde players from RewOnKillRepFaction2';

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureOnkillReputationService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
