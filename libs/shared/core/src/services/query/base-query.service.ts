import { squelConfig } from '@keira/shared/config';
import { QueryForm, TableRow } from '@keira/shared/constants';
import { map, Observable } from 'rxjs';
import { escape } from 'sqlstring';
import * as squel from 'squel';

export abstract class BaseQueryService {
  protected cache: { [key: string]: Promise<string>[] } = {};

  abstract query<T extends TableRow>(queryString: string): Observable<T[]>;

  // Input query format must be: SELECT something AS v FROM ...
  queryValue<T extends string | number>(query: string): Observable<T | null> {
    return this.query(query).pipe(map((data) => (data && data[0] ? (data[0].v as T) : null)));
  }

  queryValueToPromise<T extends string | number>(query: string): Promise<T> {
    return this.queryValue<T>(query).toPromise();
  }

  queryToPromiseCached<T extends TableRow>(cacheId: string, id: string, query: string): Promise<T[]> {
    if (!this.cache[cacheId]) {
      this.cache[cacheId] = [];
    }
    if (!this.cache[cacheId][id]) {
      this.cache[cacheId][id] = this.query<T>(query).toPromise();
    }
    return this.cache[cacheId][id];
  }

  queryValueToPromiseCached<T extends string | number>(cacheId: string, id: string, query: string): Promise<T> {
    if (!this.cache[cacheId]) {
      this.cache[cacheId] = [];
    }
    if (!this.cache[cacheId][id]) {
      this.cache[cacheId][id] = this.queryValue<T>(query).toPromise();
    }
    return this.cache[cacheId][id];
  }

  getSearchQuery<T>(table: string, queryForm: QueryForm<T>, selectFields: string[] = null, groupFields: string[] = null): string {
    const query = squel.select(squelConfig).from(table);

    if (selectFields) {
      query.fields(selectFields);
    }

    const filters = queryForm.fields;

    for (const filterKey of Object.keys(filters)) {
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
