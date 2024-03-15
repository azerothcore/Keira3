import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplateService } from './item-loot-template.service';

describe('ItemLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        ItemHandlerService,
        ItemLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    const service: ItemLootTemplateService = TestBed.inject(ItemLootTemplateService);
    expect(service).toBeTruthy();
  });
});
