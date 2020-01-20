import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '../../shared/abstract/service/handlers/handler.service';
import { ItemTemplate } from '../../shared/types/item-template.type';

@Injectable({
  providedIn: 'root'
})
export class ItemHandlerService extends HandlerService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'item/item-template',
      router,
    );
  }
}
