import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TableRow } from '@keira/shared-constants';
import { MysqlQueryService } from '@keira/core';
import { HandlerService } from '@keira/core';
import { SingleRowEditorService } from '@keira/core';
import { SingleRowComplexKeyEditorService } from '@keira/core';
import { MultiRowEditorService } from '@keira/core';
import { MultiRowComplexKeyEditorService } from '@keira/core';

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
