import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { GameTeleService } from './game-tele.service';

describe('GameTeleService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        GameTeleService,
        GameTeleService,
      ],
    }),
  );

  it('should be created', () => {
    const service: GameTeleService = TestBed.inject(GameTeleService);
    expect(service).toBeTruthy();
  });
});
