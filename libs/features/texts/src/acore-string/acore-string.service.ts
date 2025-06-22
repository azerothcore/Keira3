import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AcoreStringHandlerService } from './acore-string-handler.service';
import { ACORE_STRING_DEFAULT, ACORE_STRING_ENTRY, ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreStringService extends SingleRowEditorService<AcoreString> {
  protected override readonly handlerService = inject(AcoreStringHandlerService);

  constructor() {
    super(AcoreString, ACORE_STRING_TABLE, ACORE_STRING_ENTRY, ACORE_STRING_DEFAULT, true);
  }
}
