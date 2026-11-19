import { inject, Service } from '@angular/core';
import { POOL_TEMPLATE_ID, POOL_TEMPLATE_NAME, POOL_TEMPLATE_TABLE, PoolTemplate } from '@keira/shared/acore-world-model';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { PoolHandlerService } from '../pool-handler.service';

@Service()
export class PoolTemplateService extends SingleRowEditorService<PoolTemplate> {
  protected override readonly handlerService = inject(PoolHandlerService);
  protected override readonly _entityClass = PoolTemplate;
  protected override readonly _entityTable = POOL_TEMPLATE_TABLE;
  protected override readonly _entityIdField = POOL_TEMPLATE_ID;
  protected override readonly _entityNameField = POOL_TEMPLATE_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}
