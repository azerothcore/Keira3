import { inject, Service } from '@angular/core';
import {
  POOL_TEMPLATE_ID,
  POOL_TEMPLATE_NAME,
  POOL_TEMPLATE_SEARCH_FIELDS,
  POOL_TEMPLATE_TABLE,
  PoolTemplate,
} from '@keira/shared/acore-world-model';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { PoolHandlerService } from '../pool-handler.service';

/** The pools of `pool_template`. */
@Service()
export class SelectPoolService extends SelectService<PoolTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(PoolHandlerService);
  protected override readonly entityTable = POOL_TEMPLATE_TABLE;
  protected override readonly entityIdField = POOL_TEMPLATE_ID;
  protected override entityNameField = POOL_TEMPLATE_NAME;
  protected override readonly fieldList = POOL_TEMPLATE_SEARCH_FIELDS as (keyof PoolTemplate & string)[];

  constructor() {
    super();
    this.init();
  }
}
