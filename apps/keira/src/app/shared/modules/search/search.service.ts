import { FormControl, FormGroup } from '@angular/forms';
import { BaseQueryService } from '@keira-shared/services/query/base-query.service';
import { ModelForm, ModelNestedForm } from '@keira-shared/utils/helpers';
import { QueryForm, StringKeys, TableRow } from '@keira/acore-world-model';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { ChangeDetectorRef } from '@angular/core';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[];
  fields: FormGroup<ModelForm<T>> = new FormGroup({} as any);
  queryForm = new FormGroup<ModelNestedForm<QueryForm<T>>>({
    limit: new FormControl<number>(50),
    fields: this.fields,
  });

  constructor(
    protected queryService: BaseQueryService,
    protected entityTable: string,
    protected fieldList: StringKeys<T>[],
    protected selectFields: string[] = null,
    protected groupFields: string[] = null,
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
        this.rows = data;
        changeDetectorRef.markForCheck();
      }),
    );
  }
}
