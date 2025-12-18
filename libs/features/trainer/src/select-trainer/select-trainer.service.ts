import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { TrainerHandlerService } from '../trainer-handler.service';
import { TRAINER_ID, TRAINER_TABLE, Trainer } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SelectTrainerService extends SelectService<Trainer> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(TrainerHandlerService);
  protected override readonly entityTable = TRAINER_TABLE;
  protected override readonly entityIdField = TRAINER_ID;
  protected override readonly fieldList = [TRAINER_ID, 'Type', 'Requirement'];
  constructor() {
    super();
    this.init();
  }
}
