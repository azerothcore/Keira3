import { Injectable } from '@angular/core';

import { SelectService } from './select.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '../../types/creature-template.type';
import { QueryService } from '../query.service';
import { CreatureHandlerService } from '../handlers/creature-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureSelectService extends SelectService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
    public handlerService: CreatureHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_NAME,
      CREATURE_TEMPLATE_SEARCH_FIELDS,
    );
  }
}
