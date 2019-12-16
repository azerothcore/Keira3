import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';

import { QueryService } from '../query.service';
import { SaiHandlerService } from './sai-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SaiGameobjectHandlerService extends SaiHandlerService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
    protected queryService: QueryService,
    @Optional() protected route: string,
  ) {
    super(
      router,
      queryService,
      'gameobject/sai-gameobject'
    );
  }
}
