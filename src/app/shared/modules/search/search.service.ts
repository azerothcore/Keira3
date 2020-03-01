import { FormControl, FormGroup } from '@angular/forms';

import { TableRow } from '../../types/general';
import { MysqlQueryService } from '../../services/mysql-query.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';

export abstract class SearchService<T extends TableRow> extends SubscriptionHandler {
  query: string;
  rows: T[];
  fields = new FormGroup({});
  queryForm = new FormGroup({
    'limit': new FormControl(100),
    'fields': this.fields,
  });
  selectFields: string[] = null;
  groupFields: string[] = null;

  constructor(
    protected queryService: MysqlQueryService,
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

  onSearch() {
    this.subscriptions.push(
      this.queryService.query<T>(this.query).subscribe((data) => {
        this.rows = data.results;
      })
    );
  }
}
