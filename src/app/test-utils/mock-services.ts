import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { SingleRowEditorService } from '../services/editors/single-row-editor.service';
import { HandlerService } from '../services/handlers/handler.service';
import { QueryService } from '../services/query.service';
import { TableRow } from '../types/general';

export const MOCK_TABLE = 'mock_table';
export const MOCK_ID = 'id';
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
export class MockEditorService extends SingleRowEditorService<MockEntity> {

  constructor(
    protected handlerService: MockHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      MockEntity,
      MOCK_TABLE,
      MOCK_ID,
      MOCK_NAME,
      true,
      handlerService,
      queryService,
    );
  }
}
