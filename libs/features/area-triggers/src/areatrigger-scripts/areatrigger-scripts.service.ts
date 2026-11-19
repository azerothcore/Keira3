import { inject, Service } from '@angular/core';
import { AREATRIGGER_SCRIPTS_ID, AREATRIGGER_SCRIPTS_TABLE, AreatriggerScripts } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

@Service()
export class AreatriggerScriptsService extends SingleRowEditorService<AreatriggerScripts> {
  protected override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override _entityClass = AreatriggerScripts;
  protected override _entityTable = AREATRIGGER_SCRIPTS_TABLE;
  protected override _entityIdField = AREATRIGGER_SCRIPTS_ID;

  constructor() {
    super();
    this.init();
  }
}
