import { Service } from '@angular/core';
import { POOL_POOL_ID, POOL_POOL_ID_2, POOL_POOL_TABLE, PoolPool } from '@keira/shared/acore-world-model';
import { PoolMembersService } from '../pool-members.service';

/** The pools in a mother pool (`pool_pool` by `mother_pool`). */
@Service()
export class PoolPoolService extends PoolMembersService<PoolPool> {
  protected override readonly _entityClass = PoolPool;
  protected override readonly _entityTable = POOL_POOL_TABLE;
  protected override readonly _entityIdField = POOL_POOL_ID;
  protected override readonly _entitySecondIdField = POOL_POOL_ID_2;

  constructor() {
    super();
    this.init();
  }
}
