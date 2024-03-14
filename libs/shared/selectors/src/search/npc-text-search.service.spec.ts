import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '@keira/shared/core';

import { NpcTextSearchService } from './npc-text-search.service';
import { MockedMysqlQueryService } from '../../services/services.mock';

describe('NpcTextSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: NpcTextSearchService = TestBed.inject(NpcTextSearchService);
    expect(service).toBeTruthy();
  });
});
