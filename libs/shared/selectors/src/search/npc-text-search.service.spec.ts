import { TestBed } from '@angular/core/testing';
import { instance, mock } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/db-layer';

import { NpcTextSearchService } from './npc-text-search.service';

describe('NpcTextSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(mock(MysqlQueryService)) }],
    }),
  );

  it('should be created', () => {
    const service: NpcTextSearchService = TestBed.inject(NpcTextSearchService);
    expect(service).toBeTruthy();
  });
});
