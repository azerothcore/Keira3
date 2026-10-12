import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { CREATURE_IMMUNITIES_TABLE, CreatureImmunities } from '@keira/shared/acore-world-model';

@Service()
export class CreatureImmunitiesHandlerService extends HandlerService<CreatureImmunities> {
  protected readonly mainEditorRoutePath = 'creature-immunities/creature-immunities';

  get isCreatureImmunitiesUnsaved(): Signal<boolean> {
    return this.statusMap[CREATURE_IMMUNITIES_TABLE].asReadonly();
  }

  protected _statusMap = {
    [CREATURE_IMMUNITIES_TABLE]: signal(false),
  };
}
