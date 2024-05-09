import { Injectable } from '@angular/core';

import { SOUND_ENTRIES_SEARCH_FIELDS, SOUND_ENTRIES_TABLE, SoundEntries } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class SoundEntriesSearchService extends SqliteSearchService<SoundEntries> {
  protected readonly entityTable = SOUND_ENTRIES_TABLE;
  protected readonly fieldList = SOUND_ENTRIES_SEARCH_FIELDS;
}
