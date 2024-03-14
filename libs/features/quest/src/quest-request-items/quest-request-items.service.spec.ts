import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestRequestItemsService } from './quest-request-items.service';

describe('QuestRequestItemsService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        QuestHandlerService,
        QuestRequestItemsService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestRequestItemsService = TestBed.inject(QuestRequestItemsService);
    expect(service).toBeTruthy();
  });
});
