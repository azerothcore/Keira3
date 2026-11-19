import { inject, Service } from '@angular/core';
import {
  CREATURE_TEMPLATE_LOCALE_ID,
  CREATURE_TEMPLATE_LOCALE_ID_2,
  CREATURE_TEMPLATE_LOCALE_TABLE,
  CreatureTemplateLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class CreatureTemplateLocaleService extends MultiRowEditorService<CreatureTemplateLocale> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureTemplateLocale;
  protected override readonly _entityTable = CREATURE_TEMPLATE_LOCALE_TABLE;
  protected override readonly _entityIdField = CREATURE_TEMPLATE_LOCALE_ID;
  protected override readonly _entitySecondIdField = CREATURE_TEMPLATE_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
