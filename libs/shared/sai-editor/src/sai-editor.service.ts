import { inject, Injectable } from '@angular/core';

import { SAI_ID_2, SAI_ID_FIELDS, SAI_TABLE, SAI_TYPES, SmartScripts } from '@keira/shared/acore-world-model';
import { MultiRowComplexKeyEditorService } from '@keira/shared/base-abstract-classes';
import { SaiCommentGeneratorService } from './sai-comment-generator.service';
import { SaiHandlerService } from './sai-handler.service';
import { lastValueFrom, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaiEditorService extends MultiRowComplexKeyEditorService<SmartScripts> {
  protected override readonly handlerService = inject(SaiHandlerService);

  protected saiCommentGeneratorService = inject(SaiCommentGeneratorService);

  protected _errorLinkedEvent = false;
  get errorLinkedEvent() {
    return this._errorLinkedEvent;
  }

  protected override _entityClass = SmartScripts;
  protected override _entityTable = SAI_TABLE;
  protected override _entityIdField = JSON.stringify(SAI_ID_FIELDS);
  protected override _entitySecondIdField = SAI_ID_2;

  constructor() {
    super();
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

  protected override updateDiffQuery(): void {
    super.updateDiffQuery();

    if (this.handlerService.templateQuery && this._diffQuery) {
      this._diffQuery = `${this.handlerService.templateQuery}\n\n${this._diffQuery}`;
    }

    this.updateEditorStatus();
  }

  protected override checkRowsCorrectness(): void {
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

  protected override onRowSelected(): void {
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
    }
  }

  async generateComments(allRows = false): Promise<void> {
    if (allRows) {
      for (const row of this._newRows) {
        row.comment = await this.generateSingleComment(row);

        if (this.isRowSelected(row)) {
          this._form.controls.comment.setValue(row.comment);
        }
      }
    } else {
      const selectedRow = this._newRows.find(this.isRowSelected.bind(this));

      if (selectedRow) {
        selectedRow.comment = await this.generateSingleComment(selectedRow);
        this._form.controls.comment.setValue(selectedRow.comment);
      }
    }

    this.updateDiffQuery();
    this.updateFullQuery();
    this.refreshDatatable();
  }

  private async generateSingleComment(row: SmartScripts): Promise<string> {
    return this.saiCommentGeneratorService.generateComment(
      structuredClone(this._newRows),
      { ...row },
      /* istanbul ignore next */
      this.handlerService.getName() ? await lastValueFrom(this.handlerService.getName() as Observable<string>) : '',
    );
  }
}
