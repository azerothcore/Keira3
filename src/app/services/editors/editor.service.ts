import { Class, TableRow } from '../../types';
import { QueryService } from '../query.service';
import { HandlerService } from '../handlers/handler.service';

export abstract class EditorService<T extends TableRow> {
  protected _loading = false;
  protected _loadedEntityId: number | string;
  protected readonly fields: string[];
  protected _diffQuery: string;
  protected _fullQuery: string;
  protected _isNew = false;

  get loadedEntityId(): string { return `${this._loadedEntityId}`; }
  get loading(): boolean { return this._loading; }
  get diffQuery(): string { return this._diffQuery; }
  get fullQuery(): string { return this._fullQuery; }
  get entityTable(): string { return this._entityTable; }
  get isNew(): boolean { return this._isNew; }

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    this.fields = this.getClassAttributes(this._entityClass);
  }

  getClassAttributes(c: Class): string[] {
    const tmpInstance = new c();
    return Object.getOwnPropertyNames(tmpInstance);
  }

  abstract reload(id: string);

  save(query: string) {
    this.queryService.query<T>(query).subscribe(() => {
      this._loading = false;
      this.reload(this.loadedEntityId);
    }, (error) => {
      // TODO
      console.log(error);
    }, () => {
      this._loading = false;
    });
  }

}
