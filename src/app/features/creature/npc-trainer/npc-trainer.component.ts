import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { NpcTrainer } from '@keira-types/npc-trainer.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcTrainerService } from './npc-trainer.service';

@Component({
  selector: 'keira-npc-trainer',
  templateUrl: './npc-trainer.component.html',
  styleUrls: ['./npc-trainer.component.scss'],
})
export class NpcTrainerComponent extends MultiRowEditorComponent<NpcTrainer> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: NpcTrainerService,
    public handlerService: CreatureHandlerService,
    readonly sqliteQueryService: SqliteQueryService,
  ) {
    super(editorService, handlerService);
  }
}
