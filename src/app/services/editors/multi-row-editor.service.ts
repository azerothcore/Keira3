import { Class, TableRow } from '../../types';
import { EditorService } from './editor.service';
import { HandlerService } from '../handlers/handler.service';
import { QueryService } from '../query.service';

export abstract class MultiRowEditorService<T extends TableRow> extends EditorService<T> {
  private _originalValue: T[];

  constructor(
    protected _entityClass: Class,
    protected _entityTable: string,
    protected _entityIdField: string,
    protected handlerService: HandlerService<T>,
    protected queryService: QueryService,
  ) {
    super(_entityClass, _entityTable, _entityIdField, handlerService, queryService);
    this.initForm();
  }
}
