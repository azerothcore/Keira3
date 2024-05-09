import { Injectable } from '@angular/core';

import { Language, LANGUAGE_SEARCH_FIELDS, LANGUAGE_TABLE } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class LanguageSearchService extends SqliteSearchService<Language> {
  protected readonly entityTable = LANGUAGE_TABLE;
  protected readonly fieldList = LANGUAGE_SEARCH_FIELDS;
}
