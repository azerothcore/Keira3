import { squelConfig } from '@keira/shared/config';
import { QueryForm, TableRow } from '@keira/shared/constants';
import { lastValueFrom, map, Observable } from 'rxjs';
import { escape } from 'sqlstring';
import * as squel from 'squel';

export abstract class BaseQueryService {
  protected cache = new Map<string, Map<string, Promise<unknown>>>();

  abstract query<T extends TableRow>(queryString: string): Observable<T[] | undefined>;

  // Input query format must be: SELECT something AS v FROM ...
  queryValue<T extends string | number>(query: string): Observable<T | null> {
    return this.query(query).pipe(map((data) => (data && data[0] ? (data[0]['v'] as T) : null)));
  }

  queryValueToPromise<T extends string | number>(query: string): Promise<T | null | undefined> {
    return this.queryValue<T>(query).toPromise();
  }

  queryToPromiseCached<T extends TableRow>(cacheId: string, id: string, query: string): Promise<T[]> {
    let cacheEntry = this.cache.get(cacheId);

    if (!cacheEntry) {
      cacheEntry = new Map<string, Promise<string>>();
      this.cache.set(cacheId, cacheEntry);
    }

    if (!cacheEntry.get(id)) {
      cacheEntry.set(id, lastValueFrom(this.query<T>(query)));
    }

    return cacheEntry.get(id) as Promise<T[]>;
  }

  queryValueToPromiseCached<T extends string | number>(cacheId: string, id: string, query: string): Promise<T> {
    let cacheEntry = this.cache.get(cacheId);

    if (!cacheEntry) {
      cacheEntry = new Map<string, Promise<string>>();
      this.cache.set(cacheId, cacheEntry);
    }

    if (!cacheEntry.get(id)) {
      cacheEntry.set(id, lastValueFrom(this.queryValue<T>(query)));
    }

    return cacheEntry.get(id) as Promise<T>;
  }

  getSearchQuery<T>(
    table: string,
    queryForm: QueryForm<T>,
    selectFields: string[] | null = null,
    groupFields: string[] | null = null,
  ): string {
    const query = squel.select(squelConfig).from(table);

    if (selectFields) {
      query.fields(selectFields);
    }

    const filters = queryForm.fields;

    for (const filterKey in filters) {
      const filter = filters[filterKey];
      if (filter !== undefined && filter !== null && filter !== '') {
        const value = escape(`%${filter}%`);

        query.where(`\`${filterKey}\` LIKE ${value}`);
      }
    }

    if (groupFields) {
      for (const groupField of groupFields) {
        query.group(groupField);
      }
    }

    if (queryForm.limit) {
      query.limit(Number(queryForm.limit));
    }

    return query.toString();
  }
}
