import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { SpellHandlerService } from '../spell-handler.service';
import { SpellDbcService } from './spell-dbc.service';

describe('SpellDbcService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        SpellHandlerService,
        SpellDbcService,
      ],
    }),
  );

  it('should be created', () => {
    const service = TestBed.inject(SpellDbcService);
    expect(service).toBeTruthy();
  });
});
