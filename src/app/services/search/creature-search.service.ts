import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { QueryService } from '../query.service';
import {
  CREATURE_TEMPLATE_SEARCH_FIELDS,
  CREATURE_TEMPLATE_TABLE,
  CreatureTemplate,
} from '../../types/creature-template.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureSearchService extends SearchService<CreatureTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
  ) {
    super(queryService, CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_SEARCH_FIELDS);
  }
}
