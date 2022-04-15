import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { MysqlQueryService } from '../../shared/services/mysql-query.service';

@Injectable()
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router, public readonly queryService: MysqlQueryService) {
    super(router, queryService);
  }
}
