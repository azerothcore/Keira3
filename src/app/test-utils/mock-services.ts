import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { SingleRowEditorService } from '../services/editors/single-row-editor.service';
import { HandlerService } from '../services/handlers/handler.service';
import { QueryService } from '../services/query.service';
import { TableRow } from '../types/general';
import { MultiRowEditorService } from '../services/editors/multi-row-editor.service';
import { SingleRowComplexKeyEditorService } from '../services/editors/single-row-complex-key-editor.service';
import { MultiRowComplexKeyEditorService } from '../services/editors/multi-row-complex-key-editor.service';
import { ToastrService } from 'ngx-toastr';

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
  providedIn: 'root'
})
export class MockHandlerService extends HandlerService<MockEntity> {
  constructor(
    protected router: Router,
  ) {
    super(
      'mock/route',
      router,
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class MockSingleRowEditorService extends SingleRowEditorService<MockEntity> {

  constructor(
    protected handlerService: MockHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MockEntity,
      MOCK_TABLE,
      MOCK_ID,
      MOCK_NAME,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class MockSingleRowComplexKeyEditorService extends SingleRowComplexKeyEditorService<MockEntity> {

  constructor(
    protected handlerService: MockHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MockEntity,
      MOCK_TABLE,
      [MOCK_ID, MOCK_ID_2],
      MOCK_NAME,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class MockMultiRowEditorService extends MultiRowEditorService<MockEntity> {

  constructor(
    protected handlerService: MockHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MockEntity,
      MOCK_TABLE,
      MOCK_ID,
      MOCK_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class MockMultiRowComplexKeyEditorService extends MultiRowComplexKeyEditorService<MockEntity> {

  constructor(
    protected handlerService: MockHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MockEntity,
      MOCK_TABLE,
      [MOCK_ID, MOCK_ID_2],
      MOCK_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }

  protected updateFullQuery(): void {}

}
