/* istanbul ignore file */
import { Injectable } from '@angular/core';
import { TableRow } from '@keira/shared/constants';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { Observable } from 'rxjs';
import { MultiRowComplexKeyEditorService } from './service/editors/multi-row-complex-key-editor.service';
import { MultiRowEditorService } from './service/editors/multi-row-editor.service';
import { MultiRowExternalEditorService } from './service/editors/multi-row-external-editor.service';
import { SingleRowComplexKeyEditorService } from './service/editors/single-row-complex-key-editor.service';
import { SingleRowEditorService } from './service/editors/single-row-editor.service';
import { HandlerService } from './service/handlers/handler.service';
import { SelectService } from './service/select/select.service';

export const MOCK_TABLE = 'mock_table';
export const MOCK_ID = 'id';
export const MOCK_ID_2 = 'guid';
export const MOCK_NAME = 'name';
export const MOCK_EXTRA_ID = 'extra_id';

export class MockEntity extends TableRow {
  id: number = 0;
  guid: number | string = 0;
  name: string = '';
}

export class MockEntityWithGuidString extends MockEntity {
  override guid: number | string = '';
}

export class MockEntityExtra extends MockEntity {
  extra_id?: any = 0;
}

@Injectable({
  providedIn: 'root',
})
export class MockHandlerService extends HandlerService<MockEntity> {
  protected readonly mainEditorRoutePath = 'mock/route';

  protected _statusMap!: {
    [MOCK_TABLE]: false;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SelectMockService extends SelectService<MockEntity> {
  constructor(
    override readonly queryService: MysqlQueryService,
    public override handlerService: MockHandlerService,
  ) {
    super(queryService, handlerService, MOCK_TABLE, MOCK_ID, MOCK_NAME, []);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowEditorService extends SingleRowEditorService<MockEntity> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntity, MOCK_TABLE, MOCK_ID, MOCK_NAME, true, handlerService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowComplexKeyEditorService extends SingleRowComplexKeyEditorService<MockEntity> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntity, MOCK_TABLE, [MOCK_ID, MOCK_ID_2], MOCK_NAME, true, handlerService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorService extends MultiRowEditorService<MockEntity> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntity, MOCK_TABLE, MOCK_ID, MOCK_ID_2, handlerService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorWithGuidStringService extends MultiRowEditorService<MockEntityWithGuidString> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntityWithGuidString, MOCK_TABLE, MOCK_ID, MOCK_ID_2, handlerService);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorExtraService extends MultiRowEditorService<MockEntityExtra> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntityExtra, MOCK_TABLE, MOCK_ID, MOCK_ID_2, handlerService, MOCK_EXTRA_ID);
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowExternalEditorService extends MultiRowExternalEditorService<MockEntity> {
  constructor(protected override handlerService: MockHandlerService) {
    super(MockEntity, MOCK_TABLE, MOCK_ID_2, handlerService);
  }

  selectQuery(id: string | number) {
    return this.queryService.query(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id1 = ${id}`,
    ) as Observable<MockEntity[]>;
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowComplexKeyEditorService extends MultiRowComplexKeyEditorService<MockEntity> {
  constructor(
    protected override handlerService: MockHandlerService,
    override readonly queryService: MysqlQueryService,
  ) {
    super(MockEntity, MOCK_TABLE, [MOCK_ID, MOCK_ID_2], MOCK_ID_2, handlerService);
  }

  protected updateFullQuery(): void {}
}
