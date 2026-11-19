import { inject, Service } from '@angular/core';
import { AREATRIGGER_TELEPORT_ID, AREATRIGGER_TELEPORT_TABLE, AreatriggerTeleport } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

@Service()
export class AreatriggerTeleportService extends SingleRowEditorService<AreatriggerTeleport> {
  protected override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override _entityClass = AreatriggerTeleport;
  protected override _entityTable = AREATRIGGER_TELEPORT_TABLE;
  protected override _entityIdField = AREATRIGGER_TELEPORT_ID;
  protected override _entityNameField = 'Name';
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
