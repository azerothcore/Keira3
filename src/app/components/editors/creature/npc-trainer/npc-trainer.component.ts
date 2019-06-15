import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { NpcTrainer } from './npc-trainer.type';
import { NpcTrainerService } from '../../../../services/editors/creature/npc-trainer.service';

@Component({
  selector: 'app-npc-trainer',
  templateUrl: './npc-trainer.component.html',
  styleUrls: ['./npc-trainer.component.scss']
})
export class NpcTrainerComponent extends MultiRowEditorComponent<NpcTrainer> {

  constructor(
    public editorService: NpcTrainerService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }

}
