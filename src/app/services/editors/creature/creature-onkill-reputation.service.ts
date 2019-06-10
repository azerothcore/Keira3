import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import { CreatureOnkillReputation } from '../../../components/editors/creature/creature-onkill-reputation/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import { CREATURE_ONKLL_REPUTATION_TABLE, CREATURE_ONKLL_REPUTATION_ID } from '../../../constants';

@Injectable({
  providedIn: 'root'
})
export class CreatureOnkillReputationService extends SingleRowEditorService<CreatureOnkillReputation> {

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
