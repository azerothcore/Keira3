import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreTextHandlerService extends HandlerService<AcoreString> {
  protected readonly mainEditorRoutePath = 'texts/acore-string';

  get isUnsaved(): boolean {
    return this.statusMap[ACORE_STRING_TABLE];
  }

  protected _statusMap = {
    [ACORE_STRING_TABLE]: false,
  };
}
