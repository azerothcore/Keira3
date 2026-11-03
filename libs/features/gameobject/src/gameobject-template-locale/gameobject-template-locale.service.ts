import { inject, Service } from '@angular/core';
import {
  GAMEOBJECT_TEMPLATE_LOCALE_ID,
  GAMEOBJECT_TEMPLATE_LOCALE_ID_2,
  GAMEOBJECT_TEMPLATE_LOCALE_TABLE,
  GameobjectTemplateLocale,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GameobjectHandlerService } from '../gameobject-handler.service';

/** The translations of the selected entry, one row per locale (#144). */
@Service()
export class GameobjectTemplateLocaleService extends MultiRowEditorService<GameobjectTemplateLocale> {
  protected override readonly handlerService = inject(GameobjectHandlerService);
  protected override readonly _entityClass = GameobjectTemplateLocale;
  protected override readonly _entityTable = GAMEOBJECT_TEMPLATE_LOCALE_TABLE;
  protected override readonly _entityIdField = GAMEOBJECT_TEMPLATE_LOCALE_ID;
  protected override readonly _entitySecondIdField = GAMEOBJECT_TEMPLATE_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
