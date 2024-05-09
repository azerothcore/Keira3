import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from './search.service';
import { inject } from '@angular/core';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  protected readonly queryService = inject(MysqlQueryService);
  protected abstract readonly entityIdField: string;
  protected abstract readonly entityNameField: string;
  public abstract readonly handlerService: HandlerService<T>;

  onSelect({ selected }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );
  }
}
