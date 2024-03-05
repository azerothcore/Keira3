import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../services/query/mysql-query.service';

import { CreatureSearchService } from './creature-search.service';
import { MockedMysqlQueryService } from '../../services/mocks.spec';

describe('CreatureSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: CreatureSearchService = TestBed.inject(CreatureSearchService);
    expect(service).toBeTruthy();
  });
});
