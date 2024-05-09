import { FormControl, FormGroup } from '@angular/forms';
import { QueryForm, StringKeys, TableRow } from '@keira/shared/constants';
import { ChangeDetectorRef, inject } from '@angular/core';
import { BaseQueryService, MysqlQueryService, SqliteQueryService } from '@keira/shared/db-layer';
import { ModelForm, ModelNestedForm, SubscriptionHandler } from '@keira/shared/utils';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  protected abstract readonly queryService: BaseQueryService;
  protected abstract readonly entityTable: string;
  protected abstract readonly fieldList: StringKeys<T>[];

  protected readonly selectFields: string[] = null;
  protected readonly groupFields: string[] = null;

  query: string;
  rows: T[];
  fields: FormGroup<ModelForm<T>> = new FormGroup({} as any);
  queryForm = new FormGroup<ModelNestedForm<QueryForm<T>>>({
    limit: new FormControl<number>(50),
    fields: this.fields,
  });

  constructor() {
    super();
    this.init();
  }

  private init(): void {
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

export abstract class SqliteSearchService<T extends TableRow> extends SearchService<T> {
  protected readonly queryService = inject(SqliteQueryService);
}

export abstract class MysqlSearchService<T extends TableRow> extends SearchService<T> {
  protected readonly queryService = inject(MysqlQueryService);
}
