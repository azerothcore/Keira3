import { Observable } from 'rxjs';
import { escape } from 'sqlstring';
import * as squel from 'squel';

import { QueryForm, TableRow } from '@keira-types/general';
import { squelConfig } from '@keira-config/squel.config';
import { map } from 'rxjs/operators';

export abstract class QueryService {
  protected cache: { [key: string]: Promise<string>[] } = {};

  abstract query<T extends TableRow>(queryString: string): Observable<T[]>;

  // Input query format must be: SELECT something AS v FROM ...
  queryValue<T extends string | number>(query: string): Observable<T | null> {
    return this.query(query).pipe(
      map(data => data && data[0] ? data[0].v as T : null),
    );
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

  getSearchQuery(table: string, queryForm: QueryForm, selectFields: string[] = null, groupFields: string[] = null): string {
    const query = squel.select(squelConfig).from(table);

    if (selectFields) {
      query.fields(selectFields);
    }

    const filters = queryForm.fields;

    for (const filter in filters) {
      if (filters.hasOwnProperty(filter) && filters[filter] !== undefined && filters[filter] !== null) {
        const value = escape(`%${filters[filter]}%`);

        query.where(`\`${filter}\` LIKE ${value}`);
      }
    }

    if (groupFields) {
      for (const groupField of groupFields) {
        query.group(groupField);
      }
    }

    if (queryForm.limit) {
      query.limit(Number.parseInt(queryForm.limit, 10));
    }

    return query.toString();
  }
}
