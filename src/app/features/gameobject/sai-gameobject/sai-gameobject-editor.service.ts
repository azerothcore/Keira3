import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';

@Injectable()
export class SaiGameobjectEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiGameobjectHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
    protected saiCommentGeneratorService: SaiCommentGeneratorService,
  ) {
    super(
      handlerService,
      queryService,
      toastrService,
      saiCommentGeneratorService,
    );
  }
}
