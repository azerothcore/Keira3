import { FormControl, FormGroup } from '@angular/forms';

import { TableRow } from '../../types';
import { QueryService } from '../query.service';

export abstract class SearchService<T extends TableRow> {
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
    for (const field of this.fieldList) {
      this.fields.addControl(field, new FormControl());
    }

    this.query = this.queryService.getSearchQuery(this.entityTable, this.queryForm.getRawValue());

    this.queryForm.valueChanges.subscribe(() => {
      if (this.queryForm.valid) {
        this.query = this.queryService.getSearchQuery(this.entityTable, this.queryForm.getRawValue());
      }
    });
  }

  onSearch() {
    this.queryService.query<T>(this.query).subscribe((data) => {
      this.rows = data.results;
    });
  }
}
