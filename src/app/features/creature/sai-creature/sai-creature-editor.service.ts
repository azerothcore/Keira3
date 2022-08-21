import { Injectable } from '@angular/core';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';
import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ToastrService } from 'ngx-toastr';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';

@Injectable()
export class SaiCreatureEditorService extends SaiEditorService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiCreatureHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
    protected saiCommentGeneratorService: SaiCommentGeneratorService,
  ) {
    super(handlerService, queryService, toastrService, saiCommentGeneratorService);
  }
}
