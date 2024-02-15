import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';

@Injectable()
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    readonly queryService: MysqlQueryService,
  ) {
    super(router, queryService);
  }
}
