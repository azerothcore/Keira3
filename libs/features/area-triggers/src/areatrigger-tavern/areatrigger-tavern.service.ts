import { inject, Service } from '@angular/core';
import { AREATRIGGER_TAVERN_ID, AREATRIGGER_TAVERN_TABLE, AreatriggerTavern } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

@Service()
export class AreatriggerTavernService extends SingleRowEditorService<AreatriggerTavern> {
  protected override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override _entityClass = AreatriggerTavern;
  protected override _entityTable = AREATRIGGER_TAVERN_TABLE;
  protected override _entityIdField = AREATRIGGER_TAVERN_ID;

  constructor() {
    super();
    this.init();
  }
}
