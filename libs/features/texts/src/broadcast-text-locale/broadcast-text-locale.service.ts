import { inject, Service } from '@angular/core';
import {
  BROADCAST_TEXT_LOCALE_ID,
  BROADCAST_TEXT_LOCALE_ID_2,
  BROADCAST_TEXT_LOCALE_TABLE,
  BroadcastTextLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { BroadcastTextHandlerService } from '../broadcast-text/broadcast-text-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class BroadcastTextLocaleService extends MultiRowEditorService<BroadcastTextLocale> {
  protected override readonly handlerService = inject(BroadcastTextHandlerService);
  protected override readonly _entityClass = BroadcastTextLocale;
  protected override readonly _entityTable = BROADCAST_TEXT_LOCALE_TABLE;
  protected override readonly _entityIdField = BROADCAST_TEXT_LOCALE_ID;
  protected override readonly _entitySecondIdField = BROADCAST_TEXT_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
