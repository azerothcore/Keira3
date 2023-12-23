import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import {
  ReferenceLootTemplate,
  REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  REFERENCE_LOOT_TEMPLATE_TABLE,
} from '@keira-types/reference-loot-template.type';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { SelectReferenceLootService } from './select-reference-loot.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
  templateUrl: '../select-loot.component.html',
})
export class SelectReferenceLootComponent extends SelectComponent<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectReferenceLootService,
    public handlerService: ReferenceLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(
      REFERENCE_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      REFERENCE_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
