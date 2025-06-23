/* istanbul ignore file */
import { Injectable, inject } from '@angular/core';
import { TableRow, StringKeys } from '@keira/shared/constants';
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
  override readonly queryService = inject(MysqlQueryService);
  override handlerService = inject(MockHandlerService);
  protected override readonly entityTable = MOCK_TABLE;
  protected override readonly entityIdField = MOCK_ID;
  protected override entityNameField = MOCK_NAME;
  protected override readonly fieldList: StringKeys<MockEntity>[] = [];
  constructor() {
    super();
    this.init();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowEditorService extends SingleRowEditorService<MockEntity> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override _entityClass = MockEntity;
  protected override _entityTable = MOCK_TABLE;
  protected override _entityIdField = MOCK_ID;
  protected override _entityNameField = MOCK_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockSingleRowComplexKeyEditorService extends SingleRowComplexKeyEditorService<MockEntity> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override _entityClass = MockEntity;
  protected override _entityTable = MOCK_TABLE;
  protected override _entityIdField = JSON.stringify([MOCK_ID, MOCK_ID_2]);
  protected override _entityNameField = MOCK_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorService extends MultiRowEditorService<MockEntity> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override readonly _entityClass = MockEntity;
  protected override readonly _entityTable = MOCK_TABLE;
  protected override readonly _entityIdField = MOCK_ID;
  protected override readonly _entitySecondIdField = MOCK_ID_2;

  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorWithGuidStringService extends MultiRowEditorService<MockEntityWithGuidString> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override readonly _entityClass = MockEntityWithGuidString;
  protected override readonly _entityTable = MOCK_TABLE;
  protected override readonly _entityIdField = MOCK_ID;
  protected override readonly _entitySecondIdField = MOCK_ID_2;

  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowEditorExtraService extends MultiRowEditorService<MockEntityExtra> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override readonly _entityClass = MockEntityExtra;
  protected override readonly _entityTable = MOCK_TABLE;
  protected override readonly _entityIdField = MOCK_ID;
  protected override readonly _entitySecondIdField = MOCK_ID_2;
  protected override readonly _entityExtraIdField = MOCK_EXTRA_ID;

  constructor() {
    super();
  }
}

@Injectable({
  providedIn: 'root',
})
export class MockMultiRowExternalEditorService extends MultiRowExternalEditorService<MockEntity> {
  protected override readonly handlerService = inject(MockHandlerService);
  protected override _entityClass = MockEntity;
  protected override _entityTable = MOCK_TABLE;
  protected override _entitySecondIdField = MOCK_ID_2;

  constructor() {
    super();
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
  protected override readonly handlerService = inject(MockHandlerService);
  override readonly queryService = inject(MysqlQueryService);
  protected override _entityClass = MockEntity;
  protected override _entityTable = MOCK_TABLE;
  protected override _entityIdField = JSON.stringify([MOCK_ID, MOCK_ID_2]);
  protected override _entitySecondIdField = MOCK_ID_2;

  constructor() {
    super();
  }

  protected updateFullQuery(): void {}
}
