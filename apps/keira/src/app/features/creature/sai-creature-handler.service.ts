import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MysqlQueryService, SaiHandlerService } from '@keira/core';

@Injectable()
export class SaiCreatureHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    readonly queryService: MysqlQueryService,
  ) {
    super(router, queryService);
  }
}
