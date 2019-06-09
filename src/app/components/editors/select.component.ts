import { DatatableComponent } from './datatable.component';
import { TableRow } from '../../types';
import { SelectService } from '../../services/select/select.service';
import { QueryService } from '../../services/query.service';
import { HandlerService } from '../../services/handlers/handler.service';

export abstract class SelectComponent<T extends TableRow> extends DatatableComponent {

  constructor(
    public entityTable: string,
    public entityIdField: string,
    public customStartingId: number,
    public selectService: SelectService<T>,
    public handlerService: HandlerService<T>,
    public queryService: QueryService,
  ) {
    super();
  }
}
