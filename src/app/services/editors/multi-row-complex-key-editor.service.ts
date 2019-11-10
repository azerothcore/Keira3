// import { distinctUntilChanged } from 'rxjs/operators';
//
// import { Class, MysqlResult, TableRow } from '../../types/general';
// import { HandlerService } from '../handlers/handler.service';
// import { QueryService } from '../query.service';
// import { MultiRowEditorService } from './multi-row-editor.service';
//
// export abstract class MultiRowComplexKeyEditorService<T extends TableRow> extends MultiRowEditorService<T> {
//
//   get entityIdFields(): string[] {
//     return JSON.parse(this._entityIdField);
//   }
//
//   /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
//   constructor(
//     protected _entityClass: Class,
//     protected _entityTable: string,
//     _entityIdField: string[],
//     protected _entitySecondIdField: string,
//     protected handlerService: HandlerService<T>,
//     protected queryService: QueryService,
//   ) {
//     super(
//       _entityClass,
//       _entityTable,
//       JSON.stringify(_entityIdField),
//       _entitySecondIdField,
//       handlerService,
//       queryService,
//     );
//   }
//
//   protected updateDiffQuery(): void {
//     this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<T>(
//       this._entityTable,
//       this._entityIdField,
//       this._entitySecondIdField,
//       this._originalRows,
//       this._newRows,
//     );
//   }
//
//   protected updateFullQuery(): void {
//     this._fullQuery = this.queryService.getFullDeleteInsertQuery<T>(
//       this._entityTable,
//       this._newRows,
//       this._entityIdField,
//     );
//   }
//
//   private addIdToNewRow(newRow): void {
//     newRow[this._entityIdField] = Number.parseInt(this.loadedEntityId, 10);
//   }
// }
