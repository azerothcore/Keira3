/* istanbul ignore file */ // TODO: fix coverage

import { Class } from '@keira/shared/constants';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, LootTemplate } from '@keira/shared/acore-world-model';
import { Observable } from 'rxjs';
import { MultiRowEditorService } from './multi-row-editor.service';

// Extended only by the loot tables that require a template loot id
export abstract class LootEditorIdService<T extends LootTemplate> extends MultiRowEditorService<T> {
  get entityTemplateTable(): string {
    return this._entityTemplateTable;
  }
  get entityTemplateLootField(): string {
    return this._entityTemplateLootField;
  }

  protected abstract override _entityClass: Class;
  protected abstract override _entityTable: string;
  protected _entityTemplateTable!: string; // e.g. creature_template
  protected _entityTemplateIdField!: string; // e.g. entry
  protected _entityTemplateLootField!: string; // e.g. lootid

  protected constructor() {
    super();
  }

  getLootId(): Observable<{ lootId: number }[]> {
    return this.queryService.query(
      `SELECT ${this._entityTemplateLootField} AS lootId ` +
        `FROM ${this._entityTemplateTable} ` +
        `WHERE ${this._entityTemplateIdField} = ${this.handlerService.selected}`,
    );
  }
}
