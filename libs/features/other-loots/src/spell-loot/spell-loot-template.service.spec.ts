import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockedMysqlQueryService, MockedToastrService, MysqlQueryService, SqliteService, MockedSqliteService } from '@keira/shared/core';

import { ToastrService } from 'ngx-toastr';
import { instance } from 'ts-mockito';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SpellLootTemplateService } from './spell-loot-template.service';

describe('SpellLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) },
        { provide: ToastrService, useValue: instance(MockedToastrService) },
        { provide: SqliteService, useValue: instance(MockedSqliteService) },
        SpellLootHandlerService,
        SpellLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SpellLootTemplateService)).toBeTruthy();
  });
});
