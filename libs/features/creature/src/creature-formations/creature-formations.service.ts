import { Injectable, inject } from '@angular/core';
import {
  CREATURE_FORMATIONS_LEADER_GUID,
  CREATURE_FORMATIONS_MEMBER_GUID,
  CREATURE_FORMATIONS_TABLE,
  CreatureFormation,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureFormationsService extends MultiRowEditorService<CreatureFormation> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureFormation;
  protected override readonly _entityTable = CREATURE_FORMATIONS_TABLE;
  protected override readonly _entityIdField = CREATURE_FORMATIONS_LEADER_GUID;
  protected override readonly _entitySecondIdField = CREATURE_FORMATIONS_MEMBER_GUID;

  constructor() {
    super();
  }
}
