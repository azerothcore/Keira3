import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { QUEST_REQUEST_ITEMS_ID, QUEST_REQUEST_ITEMS_TABLE, QuestRequestItems } from '@keira/shared/acore-world-model';
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
