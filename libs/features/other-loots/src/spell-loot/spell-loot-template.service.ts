import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SpellLootTemplateService extends MultiRowEditorService<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SpellLootHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(SpellLootTemplate, SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService, queryService, toastrService);
  }
}
