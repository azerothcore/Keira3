import { StringKeys, TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { HandlerService } from '../handlers/handler.service';
import { SearchService } from './search.service';

export abstract class SelectService<T extends TableRow> extends SearchService<T> {
  override abstract readonly queryService: MysqlQueryService;
  abstract readonly handlerService: HandlerService<T>;
  protected abstract readonly entityTable: string;
  protected abstract readonly entityIdField: string;
  protected entityNameField: string | undefined | null = undefined;
  protected override abstract readonly fieldList: StringKeys<T>[];
  protected override readonly selectFields: string[] | undefined = undefined;
  protected override readonly groupFields: string[] | undefined = undefined;

  protected constructor() {
    super();
  }

  onSelect({ selected }: { selected: { [_key: string]: string | number }[] }) {
    this.handlerService.select(
      false,
      `${selected[0][this.entityIdField]}`,
      this.entityNameField ? `${selected[0][this.entityNameField]}` : this.entityTable,
    );

    if ('Quality' in selected[0]) this.handlerService.itemQualityScssClass = selected[0]['Quality'] as number;
  }
}
