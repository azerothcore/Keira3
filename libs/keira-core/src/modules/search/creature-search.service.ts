import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { CREATURE_TEMPLATE_SEARCH_FIELDS, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureSearchService extends SearchService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, CREATURE_TEMPLATE_TABLE, CREATURE_TEMPLATE_SEARCH_FIELDS);
  }
}
