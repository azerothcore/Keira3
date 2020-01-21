import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowComplexKeyEditorService } from '../../shared/abstract/service/editors/multi-row-complex-key-editor.service';
import { SAI_ID_2, SAI_ID_FIELDS, SAI_TABLE, SmartScripts } from '@keira-types/smart-scripts.type';
import { SaiHandlerService } from '../../shared/modules/sai-editor/sai-handler.service';
import { QueryService } from '../../shared/services/query.service';

@Injectable({
  providedIn: 'root'
})
export class SaiEditorService extends MultiRowComplexKeyEditorService<SmartScripts> {

  protected _errorLinkedEvent = false;
  get errorLinkedEvent() { return this._errorLinkedEvent; }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      SmartScripts,
      SAI_TABLE,
      SAI_ID_FIELDS,
      SAI_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<SmartScripts>(
      this._entityTable,
      this._newRows,
      'source_type',
      'entryorguid',
      true,
    );

    if (this.handlerService.templateQuery) {
      this._fullQuery = `${this.handlerService.templateQuery}\n\n${this._fullQuery}`;
    }
  }

  protected updateDiffQuery(): void {
    super.updateDiffQuery();

    if (this.handlerService.templateQuery) {
      this._diffQuery = `${this.handlerService.templateQuery}\n\n${this._diffQuery}`;
    }
  }

  protected checkRowsCorrectness(): void {
    this._errors = [];

    const links = new Set();
    for (const row of this.newRows) {
      if (row.link !== 0) {
        links.add(row.link);
      }
    }

    if (links.size === 0) {
      return;
    }

    for (const row of this.newRows) {
      if (links.has(row.id) && row.event_type !== 61) {
        this._errorLinkedEvent = true;
        this._errors.push(`ERROR: the SAI (id: ${row.id}) is being linked by another event so it must have Event type "61 - LINK"`);
      }

      links.delete(row.id);
    }

    if (links.size !== 0) {
      this._errors.push(`ERROR: non-existing links: ${Array.from(links).join(' ')}`);
    }

  }
}
