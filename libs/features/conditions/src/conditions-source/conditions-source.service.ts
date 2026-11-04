import { inject, Service } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Conditions, CONDITIONS_TABLE } from '@keira/shared/acore-world-model';
import { MultiRowComplexKeyEditorService } from '@keira/shared/base-abstract-classes';
import { ModelForm } from '@keira/shared/utils';
import { ConditionsSourceHandlerService } from './conditions-source-handler.service';
import { CONDITION_ROW_FIELDS, CONDITIONS_SOURCE_FIELDS, conditionRowId, conditionsSourceQuery } from './conditions-source-query';

/** All the conditions of one source, like the rows of a SmartAI script (#3154). */
@Service()
export class ConditionsSourceService extends MultiRowComplexKeyEditorService<Conditions> {
  protected override readonly handlerService = inject(ConditionsSourceHandlerService);
  protected override _entityClass = Conditions;
  protected override _entityTable = CONDITIONS_TABLE;
  protected override _entityIdField = JSON.stringify(CONDITIONS_SOURCE_FIELDS);
  /** (a new condition gets a free ElseGroup only when an empty one is there already) */
  protected override _entitySecondIdField = 'ElseGroup';

  constructor() {
    super();
    this.init();
  }

  protected override getNewRowId(row: Conditions): string {
    return conditionRowId(row);
  }

  protected override getNewRowIdForm(controls: FormGroup<ModelForm<Conditions>>['controls']): string {
    return conditionRowId(
      Object.fromEntries(CONDITION_ROW_FIELDS.map((field) => [field, controls[field].value])) as Pick<
        Conditions,
        (typeof CONDITION_ROW_FIELDS)[number]
      >,
    );
  }

  protected override assignNewRowIds(newRow: Conditions): void {
    if (this._newRows.some((row) => conditionRowId(row) === conditionRowId(newRow))) {
      super.assignNewRowIds(newRow);
    }
  }

  private changed(): boolean {
    const ids = (rows: Conditions[]) => JSON.stringify(rows.map((row) => JSON.stringify(row)).sort());
    return ids(this._originalRows) !== ids(this._newRows);
  }

  protected override updateDiffQuery(): void {
    this._diffQuery = this.changed() ? conditionsSourceQuery(this._loadedEntityId as Partial<Conditions>, this._newRows) : '';
    this.updateEditorStatus();
  }

  protected override updateFullQuery(): void {
    this._fullQuery = conditionsSourceQuery(this._loadedEntityId as Partial<Conditions>, this._newRows);
  }
}
