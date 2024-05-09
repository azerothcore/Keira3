import { StringKeys, TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from './search.service';

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

  onSelect({ selected }: { selected: { [key: string]: string | number }[] }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );
  }
}
