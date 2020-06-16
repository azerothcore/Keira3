import { Component, } from '@angular/core';

import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { SelectFishingLootService } from './select-fishing-loot.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  FISHING_LOOT_TEMPLATE_TABLE,
  FishingLootTemplate
} from '@keira-types/fishing-loot-template.type';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Component({
  selector: 'keira-select-creature',
  templateUrl: '../select-loot.component.html',
})
export class SelectFishingLootComponent extends SelectComponent<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectFishingLootService,
    public handlerService: FishingLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(
      FISHING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      FISHING_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
