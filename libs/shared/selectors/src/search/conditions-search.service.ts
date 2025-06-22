import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Conditions, CONDITIONS_SEARCH_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ConditionsSearchService extends SearchService<Conditions> {
  override readonly queryService = inject(MysqlQueryService);
  protected readonly entityTable = CONDITIONS_TABLE;
  protected readonly fieldList = CONDITIONS_SEARCH_FIELDS;
  private readonly init = this.init();
}
