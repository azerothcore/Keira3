import { Service, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_IMMUNITIES_ID, CREATURE_IMMUNITIES_TABLE, CreatureImmunities } from '@keira/shared/acore-world-model';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';

@Service()
export class CreatureImmunitiesService extends SingleRowEditorService<CreatureImmunities> {
  protected override readonly handlerService = inject(CreatureImmunitiesHandlerService);
  protected override _entityClass = CreatureImmunities;
  protected override _entityTable = CREATURE_IMMUNITIES_TABLE;
  protected override _entityIdField = CREATURE_IMMUNITIES_ID;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
