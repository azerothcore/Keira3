import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { Disables, DISABLES_TABLE } from '@keira/shared/acore-world-model';

/** The disables of one source type (spells, quests, maps…): `selected` is the sourceType. */
@Service()
export class DisablesHandlerService extends HandlerService<Disables> {
  protected readonly mainEditorRoutePath = 'disables/disables';

  get isDisablesUnsaved(): Signal<boolean> {
    return this.statusMap[DISABLES_TABLE].asReadonly();
  }

  protected _statusMap = {
    [DISABLES_TABLE]: signal(false),
  };
}
