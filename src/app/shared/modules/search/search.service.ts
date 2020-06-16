import { FormControl, FormGroup } from 'ngx-typesafe-forms';

import { QueryForm, StringKeys, TableRow } from '../../types/general';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { QueryService } from '@keira-shared/services/query.service';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[];
  fields: FormGroup<T> = new FormGroup({} as any);
  queryForm = new FormGroup<QueryForm<T>>({
    'limit': new FormControl(50),
    'fields': this.fields,
  });

  constructor(
    protected queryService: QueryService,
    protected entityTable: string,
    protected fieldList: StringKeys<T>[],
    protected selectFields: string[] = null,
    protected groupFields: string[] = null,
  ) {
    super();

    for (const field of this.fieldList) {
      this.fields.addControl(field, new FormControl());
    }

    this.query = this.queryService.getSearchQuery(
      this.entityTable,
      this.queryForm.getRawValue(),
      this.selectFields,
      this.groupFields,
    );

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
      })
    );
  }

  onSearch() {
    this.subscriptions.push(
      this.queryService.query<T>(this.query).subscribe((data) => {
        this.rows = data;
      })
    );
  }
}
