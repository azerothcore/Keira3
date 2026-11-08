import { Service } from '@angular/core';
import { GAME_EVENT_POOL_ID, GAME_EVENT_POOL_ID_2, GAME_EVENT_POOL_TABLE, GameEventPool } from '@keira/shared/acore-world-model';
import { PoolMembersService } from '../pool-members.service';

/** The game event of a pool (`game_event_pool`: one per pool). */
@Service()
export class GameEventPoolService extends PoolMembersService<GameEventPool> {
  protected override readonly _entityClass = GameEventPool;
  protected override readonly _entityTable = GAME_EVENT_POOL_TABLE;
  protected override readonly _entityIdField = GAME_EVENT_POOL_ID;
  protected override readonly _entitySecondIdField = GAME_EVENT_POOL_ID_2;

  constructor() {
    super();
    this.init();
  }
}
