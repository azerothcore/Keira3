import { TableRow } from '@keira-types/general';
import { MysqlQueryService } from '../../../services/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from '../../../modules/search/search.service';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly queryService: MysqlQueryService,
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
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );
  }
}
