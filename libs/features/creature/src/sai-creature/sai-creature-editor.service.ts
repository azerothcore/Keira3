import { Injectable } from '@angular/core';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiEditorService } from '@keira/shared/sai-editor';

@Injectable({
  providedIn: 'root',
})
export class SaiCreatureEditorService extends SaiEditorService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: SaiCreatureHandlerService) {
    super(handlerService);
  }
}
