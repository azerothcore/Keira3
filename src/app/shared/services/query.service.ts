import { Observable } from 'rxjs';
import { escape } from 'sqlstring';
import * as squel from 'squel';

import { QueryForm, TableRow } from '@keira-types/general';
import { squelConfig } from '@keira-config/squel.config';

export abstract class QueryService {

  abstract query<T extends TableRow>(queryString: string): Observable<T[]>;

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
