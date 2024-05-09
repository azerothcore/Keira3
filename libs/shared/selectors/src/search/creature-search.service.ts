import { Injectable } from '@angular/core';
import { CREATURE_TEMPLATE_SEARCH_FIELDS, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class CreatureSearchService extends MysqlSearchService<CreatureTemplate> {
  protected readonly entityTable = CREATURE_TEMPLATE_TABLE;
  protected readonly fieldList = CREATURE_TEMPLATE_SEARCH_FIELDS;
}
