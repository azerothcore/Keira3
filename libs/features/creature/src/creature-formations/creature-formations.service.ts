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

  constructor() {
    super(CreatureFormation, CREATURE_FORMATIONS_TABLE, CREATURE_FORMATIONS_LEADER_GUID, CREATURE_FORMATIONS_MEMBER_GUID);
  }
}
