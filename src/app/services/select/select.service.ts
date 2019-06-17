import { FormControl, FormGroup } from '@angular/forms';

import { TableRow } from '../../types';
import { QueryService } from '../query.service';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from './search.service';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  constructor(
    protected queryService: QueryService,
    public handlerService: HandlerService<T>,
    protected entityTable: string,
    protected entityIdField: string,
    protected entityNameField: string,
    protected fieldList: string[],
  ) {
    super(queryService, entityTable, fieldList);
  }

  onSelect({ selected }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      `${selected[0][this.entityNameField]}`,
    );
  }
}
