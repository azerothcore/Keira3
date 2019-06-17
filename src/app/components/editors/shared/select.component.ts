import { TableRow } from '../../../types/general';
import { SelectService } from '../../../services/select/select.service';
import { QueryService } from '../../../services/query.service';
import { HandlerService } from '../../../services/handlers/handler.service';
import { DTCFG } from '../../../config/datatable.config';

export abstract class SelectComponent<T extends TableRow> {

  public readonly DTCFG = DTCFG;

  constructor(
    public entityTable: string,
    public entityIdField: string,
    public customStartingId: number,
    public selectService: SelectService<T>,
    public handlerService: HandlerService<T>,
    public queryService: QueryService,
  ) { }
}
