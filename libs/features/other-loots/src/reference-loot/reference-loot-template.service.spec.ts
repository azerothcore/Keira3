import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MysqlQueryService, SqliteService } from '@keira/shared/db-layer';

import { ToastrService } from 'ngx-toastr';
import { instance, mock } from 'ts-mockito';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateService } from './reference-loot-template.service';

describe('ReferenceLootTemplateService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        { provide: ToastrService, useValue: instance(mock(ToastrService)) },
        { provide: SqliteService, useValue: instance(mock(SqliteService)) },
        ReferenceLootHandlerService,
        ReferenceLootTemplateService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(ReferenceLootTemplateService)).toBeTruthy();
  });
});
