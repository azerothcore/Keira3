import { Injectable } from '@angular/core';

import { SOUND_ENTRIES_SEARCH_FIELDS, SOUND_ENTRIES_TABLE, SoundEntries } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SoundEntriesSearchService extends SearchService<SoundEntries> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, SOUND_ENTRIES_TABLE, SOUND_ENTRIES_SEARCH_FIELDS);
  }
}
