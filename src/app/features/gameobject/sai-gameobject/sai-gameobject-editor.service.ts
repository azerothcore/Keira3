import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { QueryService } from '@keira-shared/services/query.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

@Injectable()
export class SaiGameobjectEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiGameobjectHandlerService,
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
