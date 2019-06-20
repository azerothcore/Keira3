import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureOnkillReputation } from '../../../../types/creature-onkill-reputation.type';
import { CreatureOnkillReputationService } from '../../../../services/editors/creature/creature-onkill-reputation.service';
import { FACTIONS } from '../../../../constants/options/faction';

@Component({
  selector: 'app-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss']
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {

  public readonly FACTIONS = FACTIONS;

  constructor(
    public editorService: CreatureOnkillReputationService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
