import { Service, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  ACORE_STRING_LOCALE_ID,
  ACORE_STRING_LOCALE_ID_2,
  ACORE_STRING_LOCALE_TABLE,
  AcoreStringLocale,
} from '@keira/shared/acore-world-model';
import { AcoreStringHandlerService } from '../acore-string/acore-string-handler.service';

@Service()
export class AcoreStringLocaleService extends MultiRowEditorService<AcoreStringLocale> {
  protected override readonly handlerService = inject(AcoreStringHandlerService);
  protected override readonly _entityClass = AcoreStringLocale;
  protected override readonly _entityTable = ACORE_STRING_LOCALE_TABLE;
  protected override readonly _entityIdField = ACORE_STRING_LOCALE_ID;
  protected override readonly _entitySecondIdField = ACORE_STRING_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}
