import { Injectable } from '@angular/core';

import { Faction, FACTION_SEARCH_FIELDS, FACTION_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

@Injectable({
  providedIn: 'root',
})
export class FactionSearchService extends SearchService<Faction> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, FACTION_TABLE, FACTION_SEARCH_FIELDS);
  }
}
