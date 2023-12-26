import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Faction, FACTION_SEARCH_FIELDS, FACTION_TABLE } from '../../types/faction.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class FactionSearchService extends SearchService<Faction> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, FACTION_TABLE, FACTION_SEARCH_FIELDS);
  }
}
