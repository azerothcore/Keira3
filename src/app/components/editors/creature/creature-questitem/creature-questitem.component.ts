import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureQuestitem } from '../../../../types/creature-questitem.type';
import { CreatureQuestitemService } from '../../../../services/editors/creature/creature-questitem.service';

@Component({
  selector: 'app-creature-questitem',
  templateUrl: './creature-questitem.component.html',
  styleUrls: ['./creature-questitem.component.scss']
})
export class CreatureQuestitemComponent extends MultiRowEditorComponent<CreatureQuestitem> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureQuestitemService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}
