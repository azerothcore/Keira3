import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { QueryService } from '../query.service';
import { SaiHandlerService } from './sai-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SaiCreatureHandlerService extends SaiHandlerService {
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
