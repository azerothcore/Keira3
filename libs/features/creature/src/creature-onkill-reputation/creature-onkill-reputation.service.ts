import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_ONKLL_REPUTATION_ID, CREATURE_ONKLL_REPUTATION_TABLE, CreatureOnkillReputation } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureOnkillReputationService extends SingleRowEditorService<CreatureOnkillReputation> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  constructor() {
    super(CreatureOnkillReputation, CREATURE_ONKLL_REPUTATION_TABLE, CREATURE_ONKLL_REPUTATION_ID, null, false);
  }
}
