import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_DEFAULT_TRAINER_ID, CREATURE_DEFAULT_TRAINER_TABLE, CreatureDefaultTrainer } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureDefaultTrainerService extends SingleRowEditorService<CreatureDefaultTrainer> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureDefaultTrainer;
  protected override readonly _entityTable = CREATURE_DEFAULT_TRAINER_TABLE;
  protected override readonly _entityIdField = CREATURE_DEFAULT_TRAINER_ID;

  constructor() {
    super();
    this.init();
  }
}
