import { StringKeys, TableRow } from '@keira/acore-world-model';
import { MysqlQueryService } from '../../../services/query/mysql-query.service';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from '../../../modules/search/search.service';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: HandlerService<T>,
    protected entityTable: string,
    protected entityIdField: string,
    protected entityNameField: string,
    protected fieldList: StringKeys<T>[],
    protected selectFields: string[] = null,
    protected groupFields: string[] = null,
  ) {
    super(queryService, entityTable, fieldList, selectFields, groupFields);
  }

  onSelect({ selected }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );
  }
}
