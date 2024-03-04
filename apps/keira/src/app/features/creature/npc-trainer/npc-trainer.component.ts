import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent, SqliteQueryService } from '@keira/core';
import { NpcTrainer } from '@keira/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { NpcTrainerService } from './npc-trainer.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
