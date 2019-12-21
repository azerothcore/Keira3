import { Injectable } from '@angular/core';

import { MultiRowComplexKeyEditorService } from '../multi-row-complex-key-editor.service';
import { SAI_ID_2, SAI_ID_FIELDS, SAI_TABLE, SmartScripts } from '../../../types/smart-scripts.type';
import { SaiHandlerService } from '../../handlers/sai-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class SaiEditorService extends MultiRowComplexKeyEditorService<SmartScripts> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      SmartScripts,
      SAI_TABLE,
      SAI_ID_FIELDS,
      SAI_ID_2,
      handlerService,
      queryService,
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
}
