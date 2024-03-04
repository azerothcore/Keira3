import { Injectable } from '@angular/core';
import { MysqlQueryService, SaiCommentGeneratorService, SaiEditorService } from '@keira/core';
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
