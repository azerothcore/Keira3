import { Injectable } from '@angular/core';
import { GAMEOBJECT_TEMPLATE_SEARCH_FIELDS, GAMEOBJECT_TEMPLATE_TABLE, GameobjectTemplate } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSearchService extends MysqlSearchService<GameobjectTemplate> {
  protected readonly entityTable = GAMEOBJECT_TEMPLATE_TABLE;
  protected readonly fieldList = GAMEOBJECT_TEMPLATE_SEARCH_FIELDS;
}
