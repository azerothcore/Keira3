import { Injectable } from '@angular/core';
import { Conditions, CONDITIONS_SEARCH_FIELDS, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ConditionsSearchService extends MysqlSearchService<Conditions> {
  protected readonly entityTable = CONDITIONS_TABLE;
  protected readonly fieldList = CONDITIONS_SEARCH_FIELDS;
}
