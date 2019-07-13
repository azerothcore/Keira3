import { MultiRowEditorService } from './multi-row-editor.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, LootTemplate } from '../../components/editors/shared/loot-template/loot-template.type';
import { Class, MysqlResult } from '../../types/general';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';
import { Observable } from 'rxjs';

export abstract class LootEditorService<T extends LootTemplate> extends MultiRowEditorService<T> {
  get entityTemplateTable(): string { return this._entityTemplateTable; }
  get entityTemplateLootField(): string { return this._entityTemplateLootField; }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityTemplateTable: string, // e.g. creature_template
    protected _entityTemplateIdField: string, // e.g. entry
    protected _entityTemplateLootField: string, // e.g. lootid
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(_entityClass, _entityTable, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService, queryService);
  }

  getLootId(): Observable<MysqlResult<{ lootId: number }>> {
    return this.queryService.query(
      `SELECT ${this._entityTemplateLootField} AS lootId `
      + `FROM ${this._entityTemplateTable} `
      + `WHERE ${this._entityTemplateIdField} = ${this.handlerService.selected}`
    );
  }
}
