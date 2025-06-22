import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { CREATURE_TEMPLATE_SEARCH_FIELDS, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class CreatureSearchService extends SearchService<CreatureTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  protected readonly entityTable = CREATURE_TEMPLATE_TABLE;
  protected readonly fieldList = CREATURE_TEMPLATE_SEARCH_FIELDS;
  private readonly init = this.init();
}
