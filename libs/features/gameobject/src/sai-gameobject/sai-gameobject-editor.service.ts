import { Injectable } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { SaiGameobjectHandlerService } from '../sai-gameobject-handler.service';
import { SaiCommentGeneratorService, SaiEditorService } from '@keira/shared/sai-editor';

@Injectable({
  providedIn: 'root',
})
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
