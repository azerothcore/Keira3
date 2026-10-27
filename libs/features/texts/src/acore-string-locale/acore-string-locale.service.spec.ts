import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';
import { instance, mock } from 'ts-mockito';
import { ToastrService } from 'ngx-toastr';
import { AcoreStringHandlerService } from '../acore-string/acore-string-handler.service';
import { AcoreStringLocaleService } from './acore-string-locale.service';

describe(AcoreStringLocaleService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        AcoreStringHandlerService,
        AcoreStringLocaleService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(AcoreStringLocaleService)).toBeTruthy();
  });
});
