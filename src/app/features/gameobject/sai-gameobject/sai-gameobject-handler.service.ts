import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { QueryService } from '@keira-shared/services/query.service';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';

@Injectable()
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected queryService: QueryService,
  ) {
    super(
      router,
      queryService,
    );
  }
}
