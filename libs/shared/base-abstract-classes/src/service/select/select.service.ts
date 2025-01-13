import { StringKeys, TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from './search.service';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  protected constructor(
    override readonly queryService: MysqlQueryService,
    public readonly handlerService: HandlerService<T>,
    protected override readonly entityTable: string,
    protected readonly entityIdField: string,
    protected entityNameField: string | undefined | null,
    protected override readonly fieldList: StringKeys<T>[],
    protected override readonly selectFields: string[] | undefined = undefined,
    protected override readonly groupFields: string[] | undefined = undefined,
  ) {
    super(queryService, entityTable, fieldList, selectFields, groupFields);
  }

  onSelect({ selected }: { selected: { [_key: string]: string | number }[] }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );

    if ('Quality' in selected[0]) this.handlerService.ItemQualityScssClass = selected[0]['Quality'] as number;
  }
}
