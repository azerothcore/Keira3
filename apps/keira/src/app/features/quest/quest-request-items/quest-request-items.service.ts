import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { QuestRequestItems, QUEST_REQUEST_ITEMS_ID, QUEST_REQUEST_ITEMS_TABLE } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class QuestRequestItemsService extends SingleRowEditorService<QuestRequestItems> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(QuestRequestItems, QUEST_REQUEST_ITEMS_TABLE, QUEST_REQUEST_ITEMS_ID, null, false, handlerService, queryService, toastrService);
  }
}
