import { FormControl, FormGroup } from '@angular/forms';

import { TableRow } from '../../types/general';
import { QueryService } from '../query.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[];
  fields = new FormGroup({});
  queryForm = new FormGroup({
    'limit': new FormControl(100),
    'fields': this.fields,
  });

  constructor(
    protected queryService: QueryService,
    protected entityTable: string,
    protected fieldList: string[],
  ) {
    super();

    for (const field of this.fieldList) {
      this.fields.addControl(field, new FormControl());
    }

    this.query = this.queryService.getSearchQuery(this.entityTable, this.queryForm.getRawValue());

    this.subscriptions.push(
      this.queryForm.valueChanges.subscribe(() => {
        if (this.queryForm.valid) {
          this.query = this.queryService.getSearchQuery(this.entityTable, this.queryForm.getRawValue());
        }
      })
    );
  }

  onSearch() {
    this.subscriptions.push(
      this.queryService.query<T>(this.query).subscribe((data) => {
        this.rows = data.results;
      })
    );
  }
}
