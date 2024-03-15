/* istanbul ignore file */ // TODO: fix coverage
import { ChangeDetectorRef, inject } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { SelectService } from '../../service/select/select.service';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../../service/handlers/handler.service';
import { DTCFG } from '@keira/shared/config';

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
