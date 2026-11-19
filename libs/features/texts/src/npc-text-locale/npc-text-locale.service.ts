import { inject, Service } from '@angular/core';
import { NPC_TEXT_LOCALE_ID, NPC_TEXT_LOCALE_ID_2, NPC_TEXT_LOCALE_TABLE, NpcTextLocale } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { NpcTextHandlerService } from '../npc-text/npc-text-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class NpcTextLocaleService extends MultiRowEditorService<NpcTextLocale> {
  protected override readonly handlerService = inject(NpcTextHandlerService);
  protected override readonly _entityClass = NpcTextLocale;
  protected override readonly _entityTable = NPC_TEXT_LOCALE_TABLE;
  protected override readonly _entityIdField = NPC_TEXT_LOCALE_ID;
  protected override readonly _entitySecondIdField = NPC_TEXT_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
