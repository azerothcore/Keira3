import { Service, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { CREATURE_IMMUNITIES_ID, CREATURE_IMMUNITIES_TABLE, CreatureImmunities } from '@keira/shared/acore-world-model';
import { CreatureImmunitiesHandlerService } from '../creature-immunities-handler.service';

@Service()
export class SelectCreatureImmunitiesService extends SelectService<CreatureImmunities> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(CreatureImmunitiesHandlerService);
  protected override readonly entityTable = CREATURE_IMMUNITIES_TABLE;
  protected override readonly entityIdField = CREATURE_IMMUNITIES_ID;
  protected override readonly fieldList = [CREATURE_IMMUNITIES_ID];
  protected override readonly orderFields = [CREATURE_IMMUNITIES_ID];

  constructor() {
    super();
    this.init();
  }
}
