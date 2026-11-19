import { inject, Service } from '@angular/core';
import { AREATRIGGER_ID, AREATRIGGER_TABLE, Areatrigger } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

@Service()
export class AreatriggerService extends SingleRowEditorService<Areatrigger> {
  protected override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override _entityClass = Areatrigger;
  protected override _entityTable = AREATRIGGER_TABLE;
  protected override _entityIdField = AREATRIGGER_ID;

  constructor() {
    super();
    this.init();
  }
}
