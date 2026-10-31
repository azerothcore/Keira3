import { Service } from '@angular/core';
import {
  POOL_CREATURE_TABLE,
  POOL_GAMEOBJECT_TABLE,
  POOL_MEMBER_ID,
  POOL_MEMBER_ID_2,
  PoolCreature,
  PoolGameobject,
} from '@keira/shared/acore-world-model';
import { PoolMembersService } from '../pool-members.service';

/** The creatures of a pool (`pool_creature`). */
@Service()
export class PoolCreatureService extends PoolMembersService<PoolCreature> {
  protected override readonly _entityClass = PoolCreature;
  protected override readonly _entityTable = POOL_CREATURE_TABLE;
  protected override readonly _entityIdField = POOL_MEMBER_ID;
  protected override readonly _entitySecondIdField = POOL_MEMBER_ID_2;

  constructor() {
    super();
    this.init();
  }
}

/** The gameobjects of a pool (`pool_gameobject`). */
@Service()
export class PoolGameobjectService extends PoolMembersService<PoolGameobject> {
  protected override readonly _entityClass = PoolGameobject;
  protected override readonly _entityTable = POOL_GAMEOBJECT_TABLE;
  protected override readonly _entityIdField = POOL_MEMBER_ID;
  protected override readonly _entitySecondIdField = POOL_MEMBER_ID_2;

  constructor() {
    super();
    this.init();
  }
}
