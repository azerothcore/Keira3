import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { ACORE_STRING_DEFAULT, ACORE_STRING_ENTRY, ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreStringService extends SingleRowEditorService<AcoreString> {
  protected override readonly handlerService = inject(AcoreStringHandlerService);
  protected override _entityClass = AcoreString;
  protected override _entityTable = ACORE_STRING_TABLE;
  protected override _entityIdField = ACORE_STRING_ENTRY;
  protected override _entityNameField = ACORE_STRING_DEFAULT;
  protected override isMainEntity = true;

  constructor() {
    super();
  }
}
