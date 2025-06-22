import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { GAMEOBJECT_TEMPLATE_SEARCH_FIELDS, GAMEOBJECT_TEMPLATE_TABLE, GameobjectTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSearchService extends SearchService<GameobjectTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  protected override readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  protected override readonly fieldList = GAMEOBJECT_TEMPLATE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}
