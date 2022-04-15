import { Injectable } from '@angular/core';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { GameobjectTemplate, GAMEOBJECT_TEMPLATE_SEARCH_FIELDS, GAMEOBJECT_TEMPLATE_TABLE } from '../../types/gameobject-template.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSearchService extends SearchService<GameobjectTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public readonly queryService: MysqlQueryService) {
    super(queryService, GAMEOBJECT_TEMPLATE_TABLE, GAMEOBJECT_TEMPLATE_SEARCH_FIELDS);
  }
}
