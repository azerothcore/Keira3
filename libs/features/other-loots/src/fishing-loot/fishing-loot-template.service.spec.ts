import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { FishingLootTemplateService } from './fishing-loot-template.service';

describe('FishingLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        FishingLootHandlerService,
        FishingLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(FishingLootTemplateService)).toBeTruthy();
  });
});
