import { inject, Service } from '@angular/core';
import { DISABLES_ID, DISABLES_ID_2, DISABLES_TABLE, Disables } from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { DisablesHandlerService } from '../disables-handler.service';

@Service()
export class DisablesService extends MultiRowEditorService<Disables> {
  protected override readonly handlerService = inject(DisablesHandlerService);
  protected override readonly _entityClass = Disables;
  protected override readonly _entityTable = DISABLES_TABLE;
  protected override readonly _entityIdField = DISABLES_ID;
  protected override readonly _entitySecondIdField = DISABLES_ID_2;

  constructor() {
    super();
    this.init();
  }
}
