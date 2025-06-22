import { Injectable, inject } from '@angular/core';

import { Language, LANGUAGE_SEARCH_FIELDS, LANGUAGE_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class LanguageSearchService extends SearchService<Language> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = LANGUAGE_TABLE;
  protected readonly fieldList = LANGUAGE_SEARCH_FIELDS;
  private readonly init = this.init();
}
