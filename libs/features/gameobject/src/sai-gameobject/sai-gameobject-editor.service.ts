import { Injectable } from '@angular/core';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiEditorService } from '@keira/shared/sai-editor';

@Injectable({
  providedIn: 'root',
})
export class SaiGameobjectEditorService extends SaiEditorService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: SaiGameobjectHandlerService) {
    super(handlerService);
  }
}
