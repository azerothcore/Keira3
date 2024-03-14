import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MailLootTemplateService } from './mail-loot-template.service';

describe('MailLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        MailLootHandlerService,
        MailLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(MailLootTemplateService)).toBeTruthy();
  });
});
