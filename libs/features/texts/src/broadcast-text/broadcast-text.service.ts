import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, BROADCAST_TEXT_TABLE, BroadcastText } from '@keira/shared/acore-world-model';
import { BroadcastTextHandlerService } from './broadcast-text-handler.service';

@Injectable({
  providedIn: 'root',
})
export class BroadcastTextService extends SingleRowEditorService<BroadcastText> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override handlerService: BroadcastTextHandlerService) {
    super(BroadcastText, BROADCAST_TEXT_TABLE, BROADCAST_TEXT_ID, BROADCAST_TEXT_NAME, true, handlerService);
  }
}
