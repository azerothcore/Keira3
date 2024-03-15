import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { QuestHandlerService } from '../quest-handler.service';
import { QuestTemplateAddonService } from './quest-template-addon.service';

describe('QuestTemplateAddonService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        QuestHandlerService,
        QuestTemplateAddonService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestTemplateAddonService = TestBed.inject(QuestTemplateAddonService);
    expect(service).toBeTruthy();
  });
});
