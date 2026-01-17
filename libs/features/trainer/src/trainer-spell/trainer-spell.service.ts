import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { TRAINER_SPELL_ID, TRAINER_SPELL_ID_2, TRAINER_SPELL_TABLE, TrainerSpell } from '@keira/shared/acore-world-model';
import { TrainerHandlerService } from '../trainer-handler.service';

@Injectable({
  providedIn: 'root',
})
export class TrainerSpellService extends MultiRowEditorService<TrainerSpell> {
  protected override readonly handlerService = inject(TrainerHandlerService);
  protected override readonly _entityClass = TrainerSpell;
  protected override readonly _entityTable = TRAINER_SPELL_TABLE;
  protected override readonly _entityIdField = TRAINER_SPELL_ID;
  protected override readonly _entitySecondIdField = TRAINER_SPELL_ID_2;

  constructor() {
    super();
    this.init();
  }
}
