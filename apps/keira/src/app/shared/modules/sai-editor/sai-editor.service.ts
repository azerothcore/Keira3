import { Injectable } from '@angular/core';
import { MultiRowComplexKeyEditorService } from '@keira-abstract/service/editors/multi-row-complex-key-editor.service';
import { SaiCommentGeneratorService } from '@keira-shared/modules/sai-editor/sai-comment-generator.service';
import { SaiHandlerService } from '@keira-shared/modules/sai-editor/sai-handler.service';
import { SAI_ID_2, SAI_ID_FIELDS, SAI_TABLE, SAI_TYPES, SmartScripts } from '@keira-types/smart-scripts.type';
import { ToastrService } from 'ngx-toastr';
import { MysqlQueryService } from '../../services/query/mysql-query.service';

@Injectable({
  providedIn: 'root',
})
export class SaiEditorService extends MultiRowComplexKeyEditorService<SmartScripts> {
  protected _errorLinkedEvent = false;
  get errorLinkedEvent() {
    return this._errorLinkedEvent;
  }

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SaiHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
    protected saiCommentGeneratorService: SaiCommentGeneratorService,
  ) {
    super(SmartScripts, SAI_TABLE, SAI_ID_FIELDS, SAI_ID_2, handlerService, queryService, toastrService);
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

    if (this.handlerService.templateQuery && this._diffQuery) {
      this._diffQuery = `${this.handlerService.templateQuery}\n\n${this._diffQuery}`;
    }

    this.updateEditorStatus();
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

  protected onRowSelected() {
    if (this.handlerService.parsedSelected.source_type === SAI_TYPES.SAI_TYPE_TIMED_ACTIONLIST) {
      this._form.controls.event_type.disable();
      this._form.controls.event_param3.disable();
      this._form.controls.event_param4.disable();
      this._form.controls.event_param5.disable();
      this._form.controls.event_param6.disable();
      this._form.controls.event_type.setValue(0);
      this._form.controls.event_param3.setValue(0);
      this._form.controls.event_param4.setValue(0);
      this._form.controls.event_param5.setValue(0);
      this._form.controls.event_param6.setValue(0);
      return true;
    }
  }

  async generateComments() {
    for (const row of structuredClone(this._newRows)) {
      row.comment = await this.saiCommentGeneratorService.generateComment(
        this._newRows,
        row,
        /* istanbul ignore next */
        await this.handlerService.getName()?.toPromise(),
      );

      if (this.isRowSelected(row)) {
        this._form.controls.comment.setValue(row.comment);
      }
    }

    this.updateDiffQuery();
    this.updateFullQuery();
    this.refreshDatatable();
  }
}
