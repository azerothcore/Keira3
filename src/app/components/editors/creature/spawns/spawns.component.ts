import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { Spawns } from './spawns.type';
import { SpawnsService } from '../../../../services/editors/creature/spawns.service';

@Component({
  selector: 'app-spawns',
  templateUrl: './spawns.component.html',
  styleUrls: ['./spawns.component.scss']
})
export class SpawnsComponent extends MultiRowEditorComponent<Spawns> {

  constructor(
    public editorService: SpawnsService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

