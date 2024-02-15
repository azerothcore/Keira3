import { Class } from '@keira-types/general';
import { LootTemplate, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira-types/loot-template.type';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { MultiRowEditorService } from './multi-row-editor.service';

// Extended only by the loot tables that require a template loot id
export abstract class LootEditorIdService<T extends LootTemplate> extends MultiRowEditorService<T> {
  get entityTemplateTable(): string {
    return this._entityTemplateTable;
  }
  get entityTemplateLootField(): string {
    return this._entityTemplateLootField;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityTemplateTable: string, // e.g. creature_template
    protected _entityTemplateIdField: string, // e.g. entry
    protected _entityTemplateLootField: string, // e.g. lootid
    protected handlerService: HandlerService<T>,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(_entityClass, _entityTable, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService, queryService, toastrService);
  }

  getLootId(): Observable<{ lootId: number }[]> {
    return this.queryService.query(
      `SELECT ${this._entityTemplateLootField} AS lootId ` +
        `FROM ${this._entityTemplateTable} ` +
        `WHERE ${this._entityTemplateIdField} = ${this.handlerService.selected}`,
    );
  }
}
