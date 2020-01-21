import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  CREATURE_ONKLL_REPUTATION_ID, CREATURE_ONKLL_REPUTATION_TABLE,
  CreatureOnkillReputation
} from '@keira-types/creature-onkill-reputation.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '@keira-shared/services/query.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureOnkillReputationService extends SingleRowEditorService<CreatureOnkillReputation> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureOnkillReputation,
      CREATURE_ONKLL_REPUTATION_TABLE,
      CREATURE_ONKLL_REPUTATION_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
