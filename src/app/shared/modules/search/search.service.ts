import { FormControl, FormGroup } from '@angular/forms';

import { TableRow } from '../../types/general';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { QueryService } from '@keira-shared/services/query.service';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[];
  fields = new FormGroup({});
  queryForm = new FormGroup({
    'limit': new FormControl(50),
    'fields': this.fields,
  });
  selectFields: string[] = null;
  groupFields: string[] = null;

  constructor(
    protected queryService: QueryService,
    protected entityTable: string,
    protected fieldList: string[],
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

  protected processRows() {}

  onSearch() {
    this.subscriptions.push(
      this.queryService.query<T>(this.query).subscribe((data) => {
        this.rows = data;
        this.processRows();
      })
    );
  }
}
