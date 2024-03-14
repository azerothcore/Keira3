import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';

describe('DisenchantLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        ItemHandlerService,
        DisenchantLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: DisenchantLootTemplateService = TestBed.inject(DisenchantLootTemplateService);
    expect(service).toBeTruthy();
  });
});
