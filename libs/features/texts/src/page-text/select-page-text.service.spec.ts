import { TestBed } from '@angular/core/testing';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { instance, mock } from 'ts-mockito';
import { SelectPageTextService } from './select-page-text.service';
import { PageTextHandlerService } from './page-text-handler.service';

describe(SelectPageTextService.name, () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        { provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) },
        SelectPageTextService,
        PageTextHandlerService,
      ],
    }),
  );

  it('should be created', () => {
    expect(TestBed.inject(SelectPageTextService)).toBeTruthy();
  });
});
