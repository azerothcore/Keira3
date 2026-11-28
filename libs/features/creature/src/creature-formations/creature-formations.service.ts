import { Service, inject } from '@angular/core';
import { CREATURE_FORMATIONS_MEMBER_GUID, CREATURE_FORMATIONS_TABLE, CreatureFormation } from '@keira/shared/acore-world-model';
import { MultiRowExternalEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Service()
export class CreatureFormationsService extends MultiRowExternalEditorService<CreatureFormation> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureFormation;
  protected override readonly _entityTable = CREATURE_FORMATIONS_TABLE;
  protected override readonly _entitySecondIdField = CREATURE_FORMATIONS_MEMBER_GUID;

  constructor() {
    super();
    this.init();
  }

  // formations are keyed by spawn guid, not by creature entry: load every formation that includes a spawn of this creature
  selectQuery(id: string | number) {
    return this.queryService.query<CreatureFormation>(
      'SELECT f.* FROM creature_formations AS f WHERE f.leaderGUID IN (' +
        'SELECT f2.leaderGUID FROM creature_formations AS f2 ' +
        `INNER JOIN creature AS c ON c.guid IN (f2.leaderGUID, f2.memberGUID) WHERE c.id = ${id}) ORDER BY f.leaderGUID, f.memberGUID`,
    );
  }
}
