import { TestBed } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectAcoreTextService } from './select-acore-text.service';
import { AcoreTextHandlerService } from './acore-text-handler.service';

describe(SelectAcoreTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectAcoreTextService,
        AcoreTextHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectAcoreTextService)).toBeTruthy();
  });
});
