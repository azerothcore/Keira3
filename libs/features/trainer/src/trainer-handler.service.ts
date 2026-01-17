import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TRAINER_TABLE, TRAINER_SPELL_TABLE, Trainer } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class TrainerHandlerService extends HandlerService<Trainer> {
  protected readonly mainEditorRoutePath = 'trainer/trainer';

  get isTrainerUnsaved(): Signal<boolean> {
    return this.statusMap[TRAINER_TABLE].asReadonly();
  }

  get isTrainerSpellUnsaved(): Signal<boolean> {
    return this.statusMap[TRAINER_SPELL_TABLE].asReadonly();
  }

  protected _statusMap = {
    [TRAINER_TABLE]: signal(false),
    [TRAINER_SPELL_TABLE]: signal(false),
  };
}
