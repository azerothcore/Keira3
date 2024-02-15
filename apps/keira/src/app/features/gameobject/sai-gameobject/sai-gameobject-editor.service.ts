import { Injectable } from '@angular/core';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';
import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { ToastrService } from 'ngx-toastr';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';

@Injectable()
export class SaiGameobjectEditorService extends SaiEditorService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiGameobjectHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
    protected saiCommentGeneratorService: SaiCommentGeneratorService,
  ) {
    super(handlerService, queryService, toastrService, saiCommentGeneratorService);
  }
}
