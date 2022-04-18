import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { CreatureTemplate, CREATURE_TEMPLATE_SEARCH_FIELDS, CREATURE_TEMPLATE_TABLE } from '../../types/creature-template.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureSearchService extends SearchService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public readonly queryService: MysqlQueryService) {
    super(queryService, CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_SEARCH_FIELDS);
  }
}
