import { Injectable, inject } from '@angular/core';

import { SOUND_ENTRIES_SEARCH_FIELDS, SOUND_ENTRIES_TABLE, SoundEntries } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class SoundEntriesSearchService extends SearchService<SoundEntries> {
  protected override queryService = inject(SqliteQueryService);
  protected override readonly entityTable = SOUND_ENTRIES_TABLE;
  protected override readonly fieldList = SOUND_ENTRIES_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
