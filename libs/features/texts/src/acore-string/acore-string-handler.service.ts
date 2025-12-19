import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { ACORE_STRING_TABLE, AcoreString } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class AcoreStringHandlerService extends HandlerService<AcoreString> {
  protected readonly mainEditorRoutePath = 'texts/acore-string';
  protected readonly copyRoutePath = 'texts/acore-string-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[ACORE_STRING_TABLE].asReadonly();
  }

  protected _statusMap = {
    [ACORE_STRING_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<AcoreString>, name?: string, navigate = true, sourceId?: string) {
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
