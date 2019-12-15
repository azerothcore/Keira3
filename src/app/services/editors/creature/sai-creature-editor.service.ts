import { Injectable } from '@angular/core';

import { SaiEditorService } from '../sai/sai-editor.service';
import { QueryService } from '../../query.service';
import { SaiCreatureHandlerService } from '../../handlers/sai-creature-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SaiCreatureEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiCreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(handlerService, queryService);
  }
}
