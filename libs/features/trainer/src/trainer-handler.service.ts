import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { TRAINER_TABLE, TRAINER_SPELL_TABLE, Trainer } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class TrainerHandlerService extends HandlerService<Trainer> {
  protected readonly mainEditorRoutePath = 'trainer/trainer';
  protected readonly copyRoutePath = 'trainer/copy';

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

  override select(isNew: boolean, id: string | number | Partial<Trainer>, name?: string, navigate = true, sourceId?: string) {
    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
