import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';
import { QuestTemplateLocaleService } from './quest-template-locale.service';
import { QuestHandlerService } from '../quest-handler.service';

describe('QuestTemplateLocaleService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        QuestHandlerService,
        QuestTemplateLocaleService,
      ],
    }),
  );

  it('should be created', () => {
    const service: QuestTemplateLocaleService = TestBed.inject(QuestTemplateLocaleService);
    expect(service).toBeTruthy();
  });
});
