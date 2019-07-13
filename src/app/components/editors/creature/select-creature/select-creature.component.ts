import { Component, } from '@angular/core';

import { SelectComponent } from '../../shared/select.component';
import {
  CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '../../../../types/creature-template.type';
import { CreatureSelectService } from '../../../../services/select/creature-select.service';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { QueryService } from '../../../../services/query.service';

@Component({
  selector: 'app-select-creature',
  templateUrl: './select-creature.component.html',
  styleUrls: ['./select-creature.component.scss']
})
export class SelectCreatureComponent extends SelectComponent<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: CreatureSelectService,
    public handlerService: CreatureHandlerService,
    public queryService: QueryService,
  ) {
    super(
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}
