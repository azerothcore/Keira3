/* istanbul ignore file */ // TODO: fix coverage
import { ChangeDetectorRef, inject } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { SelectService } from '../../service/select/select.service';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../../service/handlers/handler.service';
import { DTCFG } from '@keira/shared/config';

export abstract class SelectComponent<T extends TableRow> {
  protected abstract readonly entityTable: string;
  protected abstract readonly entityIdField: string;
  protected abstract readonly customStartingId: number;
  protected abstract readonly selectService: SelectService<T>;
  abstract readonly handlerService: HandlerService<T>;

  readonly queryService = inject(MysqlQueryService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly DTCFG = DTCFG;

  onSearch(): void {
    this.selectService.onSearch(this.changeDetectorRef);
  }
}
