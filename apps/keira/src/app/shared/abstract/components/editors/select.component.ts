import { ChangeDetectorRef, inject } from '@angular/core';
import { TableRow } from '@keira/acore-world-model';
import { SelectService } from '../../service/select/select.service';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { HandlerService } from '../../service/handlers/handler.service';
import { DTCFG } from '@keira-config/datatable.config';

export abstract class SelectComponent<T extends TableRow> {
  readonly DTCFG = DTCFG;

  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  constructor(
    public entityTable: string,
    public entityIdField: string,
    public customStartingId: number,
    public selectService: SelectService<T>,
    public handlerService: HandlerService<T>,
    public queryService: MysqlQueryService,
  ) {}

  onSearch(): void {
    this.selectService.onSearch(this.changeDetectorRef);
  }
}
