import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from './handler.service';
import { GossipMenu } from '../../types/gossip-menu.type';

@Injectable({
  providedIn: 'root'
})
export class GossipHandlerService extends HandlerService<GossipMenu> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'gossip/gossip-menu',
      router,
    );
  }
}
