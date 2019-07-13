import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  CREATURE_ONKLL_REPUTATION_ID, CREATURE_ONKLL_REPUTATION_TABLE,
  CreatureOnkillReputation
} from '../../../types/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureOnkillReputationService extends SingleRowEditorService<CreatureOnkillReputation> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureOnkillReputation,
      CREATURE_ONKLL_REPUTATION_TABLE,
      CREATURE_ONKLL_REPUTATION_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}
