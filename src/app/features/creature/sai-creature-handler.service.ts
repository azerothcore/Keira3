import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { MysqlQueryService } from '../../shared/services/mysql-query.service';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';

@Injectable()
export class SaiCreatureHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected queryService: MysqlQueryService,
  ) {
    super(
      router,
      queryService,
    );
  }
}
