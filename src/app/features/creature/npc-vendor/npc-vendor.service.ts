import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
NPC_VENDOR_ID,
NPC_VENDOR_ID_2,
NPC_VENDOR_TABLE,
NpcVendor
} from '@keira-types/npc-vendor.type';

@Injectable()
export class NpcVendorService extends MultiRowEditorService<NpcVendor> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      NpcVendor,
      NPC_VENDOR_TABLE,
      NPC_VENDOR_ID,
      NPC_VENDOR_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}
