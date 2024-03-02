import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MultiRowComplexKeyEditorService } from '../abstract/service/editors/multi-row-complex-key-editor.service';
import { MultiRowEditorService } from '../abstract/service/editors/multi-row-editor.service';
import { SingleRowComplexKeyEditorService } from '../abstract/service/editors/single-row-complex-key-editor.service';
import { SingleRowEditorService } from '../abstract/service/editors/single-row-editor.service';
import { HandlerService } from '../abstract/service/handlers/handler.service';
import { MysqlQueryService } from '../services/query/mysql-query.service';
import { TableRow } from '@keira/acore-world-model';

export const MOCK_TABLE = 'mock_table';
export const MOCK_ID = 'id';
export const MOCK_ID_2 = 'guid';
export const MOCK_NAME = 'name';

export class MockEntity extends TableRow {
  id: number = 0;
  guid: number = 0;
  name: string = '';
}

@Injectable({
  providedIn: 'root',
})
export class MockHandlerService extends HandlerService<MockEntity> {
  protected _statusMap: {
    [MOCK_TABLE]: false;
  };

  constructor(protected router: Router) {
    super('mock/route', router);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowEditorService extends SingleRowEditorService<MockEntity> {
  constructor(
    protected handlerService: MockHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(MockEntity, MOCK_TABLE, MOCK_ID, MOCK_NAME, true, handlerService, queryService, toastrService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowComplexKeyEditorService extends SingleRowComplexKeyEditorService<MockEntity> {
  constructor(
    protected handlerService: MockHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(MockEntity, MOCK_TABLE, [MOCK_ID, MOCK_ID_2], MOCK_NAME, true, handlerService, queryService, toastrService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorService extends MultiRowEditorService<MockEntity> {
  constructor(
    protected handlerService: MockHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(MockEntity, MOCK_TABLE, MOCK_ID, MOCK_ID_2, handlerService, queryService, toastrService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowComplexKeyEditorService extends MultiRowComplexKeyEditorService<MockEntity> {
  constructor(
    protected handlerService: MockHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(MockEntity, MOCK_TABLE, [MOCK_ID, MOCK_ID_2], MOCK_ID_2, handlerService, queryService, toastrService);
  }

  protected updateFullQuery(): void {}
}
