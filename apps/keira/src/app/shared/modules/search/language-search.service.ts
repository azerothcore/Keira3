import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { Language, LANGUAGE_SEARCH_FIELDS, LANGUAGE_TABLE } from '../../types/language.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class LanguageSearchService extends SearchService<Language> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, LANGUAGE_TABLE, LANGUAGE_SEARCH_FIELDS);
  }
}
