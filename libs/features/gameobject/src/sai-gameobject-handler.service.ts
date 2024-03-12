import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MysqlQueryService } from '@keira/shared/core';
import { SaiHandlerService } from '@keira/shared/sai-editor';

@Injectable({
  providedIn: 'root',
})
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    readonly queryService: MysqlQueryService,
  ) {
    super(router, queryService);
  }
}
