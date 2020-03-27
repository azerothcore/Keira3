import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import {
  FACTION_SEARCH_FIELDS,
  FACTION_TABLE,
  Faction,
} from '../../types/faction.type';

@Injectable({
  providedIn: 'root'
})
export class FactionSearchService extends SearchService<Faction> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: SqliteQueryService,
  ) {
    super(queryService, FACTION_TABLE, FACTION_SEARCH_FIELDS);
  }
}
