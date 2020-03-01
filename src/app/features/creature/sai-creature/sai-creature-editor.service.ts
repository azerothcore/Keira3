import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';

@Injectable()
export class SaiCreatureEditorService extends SaiEditorService {
  constructor(
    protected handlerService: SaiCreatureHandlerService,
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
