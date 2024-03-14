import { Injectable } from '@angular/core';

import { Language, LANGUAGE_SEARCH_FIELDS, LANGUAGE_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira/shared/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageSearchService extends SearchService<Language> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, LANGUAGE_TABLE, LANGUAGE_SEARCH_FIELDS);
  }
}
