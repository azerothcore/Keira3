import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ReferenceLootHandlerService extends HandlerService<ReferenceLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/reference';
  protected readonly copyRoutePath = 'other-loots/reference-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[REFERENCE_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [REFERENCE_LOOT_TEMPLATE_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<ReferenceLootTemplate>, name?: string, navigate = true, sourceId?: string) {
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}
