import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { CreatureQuestitem } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureQuestitemService } from './creature-questitem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-creature-questitem',
  templateUrl: './creature-questitem.component.html',
  styleUrls: ['./creature-questitem.component.scss'],
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
