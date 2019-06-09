import { TableRow } from '../../types';
import { FormControl, FormGroup } from '@angular/forms';
import { QueryService } from '../query.service';
import { HandlerService } from '../handlers/handler.service';

export abstract class SelectService<T extends TableRow> {
  query: string;
  rows: T[];
  fields = new FormGroup({});
  queryForm = new FormGroup({
    'limit': new FormControl(100),
    'fields': this.fields,
  });

  constructor(
    protected queryService: QueryService,
    public handlerService: HandlerService<T>,
    protected entityTable: string,
    protected entityIdField: string,
    protected entityNameField: string,
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

  onSelect({ selected }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      `${selected[0][this.entityNameField]}`,
    );
  }
}
