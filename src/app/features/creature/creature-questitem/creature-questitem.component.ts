import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { CreatureQuestitem } from '@keira-types/creature-questitem.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureQuestitemService } from './creature-questitem.service';

@Component({
  selector: 'keira-creature-questitem',
  templateUrl: './creature-questitem.component.html',
  styleUrls: ['./creature-questitem.component.scss'],
})
export class CreatureQuestitemComponent extends MultiRowEditorComponent<CreatureQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureQuestitemService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}
