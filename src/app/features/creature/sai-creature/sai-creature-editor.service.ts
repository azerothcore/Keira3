import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { QueryService } from '@keira-shared/services/query.service';
import { SaiCreatureHandlerService } from './sai-creature-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SaiCreatureEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiCreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      handlerService,
      queryService,
      toastrService,
    );
  }
}
