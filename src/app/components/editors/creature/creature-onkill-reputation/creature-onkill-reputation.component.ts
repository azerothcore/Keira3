import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureOnkillReputation } from './creature-onkill-reputation.type';
import { CreatureOnkillReputationService } from '../../../../services/editors/creature/creature-onkill-reputation.service';

@Component({
  selector: 'app-creature-onkill-reputation',
  templateUrl: './creature-onkill-reputation.component.html',
  styleUrls: ['./creature-onkill-reputation.component.scss']
})
export class CreatureOnkillReputationComponent extends SingleRowEditorComponent<CreatureOnkillReputation> {

  constructor(
    public editorService: CreatureOnkillReputationService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
