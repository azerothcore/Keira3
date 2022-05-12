import { Injectable } from '@angular/core';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';
import { SaiEditorService } from '@keira-shared/modules/sai-editor/sai-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ToastrService } from 'ngx-toastr';
import { SaiCreatureHandlerService } from '../sai-creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class SaiCreatureEditorService extends SaiEditorService {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiCreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
    protected saiCommentGeneratorService: SaiCommentGeneratorService,
  ) {
    super(handlerService, queryService, saveQueryService, toastrService, saiCommentGeneratorService);
  }
}
