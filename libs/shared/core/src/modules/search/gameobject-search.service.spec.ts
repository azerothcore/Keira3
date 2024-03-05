import { TestBed } from '@angular/core/testing';
import { instance } from 'ts-mockito';
import { MysqlQueryService } from '../../services/query/mysql-query.service';

import { GameobjectSearchService } from './gameobject-search.service';
import { MockedMysqlQueryService } from '../../services/mocks';

describe('GameobjectSearchService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [{ provide: MysqlQueryService, useValue: instance(MockedMysqlQueryService) }],
    }),
  );

  it('should be created', () => {
    const service: GameobjectSearchService = TestBed.inject(GameobjectSearchService);
    expect(service).toBeTruthy();
  });
});
