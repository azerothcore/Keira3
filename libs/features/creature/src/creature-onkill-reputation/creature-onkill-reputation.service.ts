import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_ONKLL_REPUTATION_ID, CREATURE_ONKLL_REPUTATION_TABLE, CreatureOnkillReputation } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureOnkillReputationService extends SingleRowEditorService<CreatureOnkillReputation> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: CreatureHandlerService) {
    super(CreatureOnkillReputation, CREATURE_ONKLL_REPUTATION_TABLE, CREATURE_ONKLL_REPUTATION_ID, null, false, handlerService);
  }
}
