import { FormControl, FormGroup } from '@angular/forms';
import { QueryForm, StringKeys, TableRow } from '@keira/shared/constants';
import { ChangeDetectorRef } from '@angular/core';
import { BaseQueryService } from '@keira/shared/db-layer';
import { ModelForm, ModelNestedForm, SubscriptionHandler } from '@keira/shared/utils';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[] | undefined;
  fields: FormGroup<ModelForm<T>> = new FormGroup({} as any);
  queryForm = new FormGroup<ModelNestedForm<QueryForm<T>>>({
    limit: new FormControl<number>(50) as any, // TODO: fix typing
    fields: this.fields as any, // TODO: fix typing
  });

  protected constructor(
    protected readonly queryService: BaseQueryService,
    protected readonly entityTable: string,
    protected readonly fieldList: StringKeys<T>[],
    protected readonly selectFields: string[] | undefined = undefined,
    protected readonly groupFields: string[] | undefined = undefined,
  ) {
    super();

    for (const field of this.fieldList) {
      this.fields.addControl(field, new FormControl());
    }

    this.query = this.queryService.getSearchQuery(this.entityTable, this.queryForm.getRawValue(), this.selectFields, this.groupFields);

    this.subscriptions.push(
      this.queryForm.valueChanges.subscribe(() => {
        if (this.queryForm.valid) {
          this.query = this.queryService.getSearchQuery(
            this.entityTable,
            this.queryForm.getRawValue(),
            this.selectFields,
            this.groupFields,
          );
        }
      }),
    );
  }

  onSearch(changeDetectorRef: ChangeDetectorRef): void {
    this.subscriptions.push(
      this.queryService.query<T>(this.query).subscribe((data) => {
        this.rows = data as T[];
        changeDetectorRef.markForCheck();
      }),
    );
  }
}
