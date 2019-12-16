import { Injectable } from '@angular/core';

import { SaiEditorService } from '../sai/sai-editor.service';
import { QueryService } from '../../query.service';
import { SaiGameobjectHandlerService } from '../../handlers/sai-gameobject-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SaiGameobjectEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiGameobjectHandlerService,
    protected queryService: QueryService,
  ) {
    super(handlerService, queryService);
  }
}
