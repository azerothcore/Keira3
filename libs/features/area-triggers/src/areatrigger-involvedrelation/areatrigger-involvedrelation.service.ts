import { inject, Service } from '@angular/core';
import {
  AREATRIGGER_INVOLVEDRELATION_ID,
  AREATRIGGER_INVOLVEDRELATION_TABLE,
  AreatriggerInvolvedrelation,
} from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { AreaTriggerHandlerService } from '../area-trigger-handler.service';

@Service()
export class AreatriggerInvolvedrelationService extends SingleRowEditorService<AreatriggerInvolvedrelation> {
  protected override readonly handlerService = inject(AreaTriggerHandlerService);
  protected override _entityClass = AreatriggerInvolvedrelation;
  protected override _entityTable = AREATRIGGER_INVOLVEDRELATION_TABLE;
  protected override _entityIdField = AREATRIGGER_INVOLVEDRELATION_ID;

  constructor() {
    super();
    this.init();
  }
}
