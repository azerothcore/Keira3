import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';
import {
  CREATURE_FORMATIONS_TABLE,
  CREATURE_FORMATIONS_MEMBER_GUID,
  CreatureFormations,
  CREATURE_FORMATIONS_LEADER_GUID,
} from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class CreatureFormationsService extends MultiRowEditorService<CreatureFormations> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(CreatureFormations, CREATURE_FORMATIONS_TABLE, CREATURE_FORMATIONS_MEMBER_GUID, CREATURE_FORMATIONS_LEADER_GUID, handlerService);
  }
}
