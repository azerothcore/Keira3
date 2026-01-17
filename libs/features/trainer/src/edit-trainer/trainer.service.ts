import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { TRAINER_ID, TRAINER_TABLE, Trainer } from '@keira/shared/acore-world-model';
import { TrainerHandlerService } from '../trainer-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TrainerService extends SingleRowEditorService<Trainer> {
  protected override readonly handlerService = inject(TrainerHandlerService);
  protected override readonly _entityClass = Trainer;
  protected override readonly _entityTable = TRAINER_TABLE;
  protected override readonly _entityIdField = TRAINER_ID;

  constructor() {
    super();
    this.init();
  }
}
