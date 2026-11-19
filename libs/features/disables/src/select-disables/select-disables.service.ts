import { inject, Service } from '@angular/core';
import { DISABLES_ID, DISABLES_ID_2, DISABLES_TABLE, Disables } from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { DisablesHandlerService } from '../disables-handler.service';

@Service()
export class SelectDisablesService extends SelectService<Disables> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(DisablesHandlerService);
  protected override readonly entityTable = DISABLES_TABLE;
  protected override readonly entityIdField = DISABLES_ID;
  protected override entityNameField = 'comment';
  protected override readonly fieldList = [DISABLES_ID, DISABLES_ID_2, 'comment'] as (keyof Disables & string)[];
  protected override readonly orderFields = [DISABLES_ID, DISABLES_ID_2];

  constructor() {
    super();
    this.init();
  }
}
