import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreStringHandlerService extends HandlerService<AcoreString> {
  protected readonly mainEditorRoutePath = 'texts/acore-string';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[ACORE_STRING_TABLE].asReadonly();
  }

  protected _statusMap = {
    [ACORE_STRING_TABLE]: signal(false),
  };
}
