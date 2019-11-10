import { Injectable } from '@angular/core';

import { MultiRowComplexKeyEditorService } from '../multi-row-complex-key-editor.service';
import { SmartScripts } from '../../../types/smart-scripts.type';

@Injectable({
  providedIn: 'root'
})
export class SaiEditorService extends MultiRowComplexKeyEditorService<SmartScripts> {

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<SmartScripts>(
      this._entityTable,
      this._newRows,
      'source_type',
      'entryorguid',
      true,
    );
  }

}
