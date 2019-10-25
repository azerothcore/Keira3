import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { ComplexKeyHandlerService } from './complex-key.handler.service';
import { SAI_ID_FIELDS, SmartScripts } from '../../types/smart-scripts.type';

@Injectable({
  providedIn: 'root'
})
export class SaiHandlerService extends ComplexKeyHandlerService<SmartScripts> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'smart-ai/editor',
      router,
      SAI_ID_FIELDS,
    );
  }
}
