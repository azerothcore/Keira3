import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/query/mysql-query.service';
import { GAMEOBJECT_TEMPLATE_SEARCH_FIELDS, GAMEOBJECT_TEMPLATE_TABLE, GameobjectTemplate } from '@keira/acore-world-model';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSearchService extends SearchService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService) {
    super(queryService, GAMEOBJECT_TEMPLATE_TABLE, GAMEOBJECT_TEMPLATE_SEARCH_FIELDS);
  }
}
