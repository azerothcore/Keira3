import { Service } from '@angular/core';
import { POOL_QUEST_ID, POOL_QUEST_ID_2, POOL_QUEST_TABLE, PoolQuest } from '@keira/shared/acore-world-model';
import { PoolMembersService } from '../pool-members.service';

/** The quests of a pool (`pool_quest`). */
@Service()
export class PoolQuestService extends PoolMembersService<PoolQuest> {
  protected override readonly _entityClass = PoolQuest;
  protected override readonly _entityTable = POOL_QUEST_TABLE;
  protected override readonly _entityIdField = POOL_QUEST_ID;
  protected override readonly _entitySecondIdField = POOL_QUEST_ID_2;

  constructor() {
    super();
    this.init();
  }
}
